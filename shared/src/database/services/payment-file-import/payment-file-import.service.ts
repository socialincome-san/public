import { ContributionStatus, PaymentEventType } from '@prisma/client';
import {
	POSTFINANCE_FTP_HOST,
	POSTFINANCE_FTP_PORT,
	POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64,
	POSTFINANCE_FTP_USER,
} from '@socialincome/functions/src/config';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { toFirebaseAdminTimestamp } from '@socialincome/shared/src/firebase/admin/utils';
import { BankWireContribution, ContributionSourceKey, StatusKey } from '@socialincome/shared/src/types/contribution';
import { Currency } from '@socialincome/shared/src/types/currency';
import xmldom from '@xmldom/xmldom';
import { DateTime } from 'luxon';
import fs from 'node:fs';
import SFTPClient from 'ssh2-sftp-client';
import { withFile } from 'tmp-promise';
import xpath from 'xpath';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { PaymentEventCreateInput } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

export class PaymenFileImportSertvice extends BaseService {
	private storageAdmin = new StorageAdmin();
	private contributorService = new ContributorService();
	private contributionService = new ContributionService();
	private readonly campaignService = new CampaignService();
	private readonly bucketName;
	private readonly xmlSelectExpression = '//ns:BkToCstmrDbtCdtNtfctn/ns:Ntfctn/ns:Ntry/ns:NtryDtls/ns:TxDtls';

	constructor(bucketName: string) {
		super();
		this.bucketName = bucketName;
	}

	/**
	 * Imports payment files from the Postfinance SFTP server to the payments files storage bucket
	 */
	async importPaymentFiles(): Promise<ServiceResult<string>> {
		const sftp = new SFTPClient();
		const bucket = this.storageAdmin.storage.bucket(this.bucketName);
		const files = (await bucket.getFiles())[0].map((file) => file.name);
		await sftp.connect({
			host: POSTFINANCE_FTP_HOST,
			port: Number(POSTFINANCE_FTP_PORT),
			username: POSTFINANCE_FTP_USER,
			privateKey: atob(POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64),
		});
		const sftpFiles = await sftp.list('/yellow-net-reports');

		const allContributions: BankWireContribution[] = [];
		for (let file of sftpFiles) {
			if (files.includes(file.name)) {
				this.logger.info(`Skipped copying file ${file.name} because it already exists in ${this.bucketName} bucket`);
				continue;
			}

			if (!file.name.startsWith('camt.054_P_')) {
				this.logger.info(`Skipped processing ${file.name} because it does not contain relevant payment data`);
				continue;
			}

			await withFile(async ({ path: tmpPath }) => {
				await sftp.get(`/yellow-net-reports/${file.name}`, tmpPath);
				const contributions = this.getContributionsFromPaymentFile(tmpPath);
				allContributions.push(...contributions);
				await this.storageAdmin.uploadFile({ bucket, sourceFilePath: tmpPath, destinationFilePath: file.name });
			});
		}
		const result = await this.createContributions(allContributions);

		if (!result.success) {
			return this.resultFail(`Error importing payment files: ${result.error}`);
		}
		return this.resultOk('Payment files successfully imported');
	}

	/**
	 * gets the contributions information from the paayment file
	 * @param file The path of the file to process
	 */
	private getContributionsFromPaymentFile(file: string): BankWireContribution[] {
		const xml = fs.readFileSync(file, 'utf8');
		const xmlDoc = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
		const select = xpath.useNamespaces({ ns: 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08' });
		const nodes = select(this.xmlSelectExpression, xmlDoc) as Node[];

		const contributions: BankWireContribution[] = [];

		for (let node of nodes) {
			const transactionId = select('string(//ns:Refs/ns:EndToEndId)', node) as string;
			const referenceId = select('string(//ns:RmtInf/ns:Strd/ns:CdtrRefInf/ns:Ref)', node) as string;

			contributions.push({
				reference_id: referenceId,
				transaction_id: transactionId,
				monthly_interval: parseInt(referenceId.slice(20, 22)),
				currency: (select('string(//ns:Amt/@Ccy)', node) as string).toUpperCase() as Currency,
				amount: parseFloat(select('string(//ns:Amt)', node) as string),
				amount_chf: parseFloat(select('string(//ns:Amt)', node) as string),
				fees_chf: 0,
				status: StatusKey.SUCCEEDED,
				created: toFirebaseAdminTimestamp(DateTime.now()),
				source: ContributionSourceKey.WIRE_TRANSFER,
				raw_content: node.toString(),
			});
		}
		return contributions;
	}

	/**
	 * creates payment events and contributions in DB
	 * @param bankContributions contributions from payment files
	 */
	private async createContributions(bankContributions: BankWireContribution[]): Promise<ServiceResult<string>> {
		try {
			// TODO: check if campagin ID exists
			const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
			if (!fallbackCampaignResult.success) {
				return this.resultFail(fallbackCampaignResult.error);
			}
			const campaignId = fallbackCampaignResult.data.id;

			const contributors = await this.contributorService.findByPaymentReferenceIds(
				bankContributions.map((c) => this.getContributorPaymentReferenceId(c.reference_id)),
			);
			if (!contributors.success) {
				return this.resultFail(`Error creating contributions from payment file`);
			}

			const failedPaymentEvents = [];

			for (let c of bankContributions) {
				const contributor = contributors.data.find(
					(contributor) => contributor.paymentReferenceId === this.getContributorPaymentReferenceId(c.reference_id),
				);
				if (!contributor) {
					this.logger.alert(`Contributor for reference ID ${c.reference_id} does not exist`);
					continue;
				}

				const paymentEvent: PaymentEventCreateInput = {
					type: PaymentEventType.bank_transfer,
					transactionId: c.transaction_id,
					metadata: {
						raw_content: c.raw_content,
					},
					contribution: {
						create: {
							amount: c.amount,
							amountChf: c.amount_chf,
							currency: c.currency,
							feesChf: c.fees_chf,
							status: ContributionStatus.succeeded,
							campaign: {
								connect: {
									id: campaignId,
								},
							},
							contributor: {
								connect: { id: contributor.id },
							},
						},
					},
				};
				try {
					const result = await this.contributionService.createContributionWithPaymentEvent(paymentEvent);
					if (!result.success) failedPaymentEvents.push(c.transaction_id);
				} catch (error) {
					failedPaymentEvents.push(c.transaction_id);
				}
			}

			if (failedPaymentEvents.length > 0) {
				this.logger.alert(
					`Failed to create payment events with contributions in payment file imports. Failed transaction IDs: ${failedPaymentEvents.join(', ')}`,
				);
				return this.resultFail(
					`Failed to create payment events with contributions. Failed transaction IDs: ${failedPaymentEvents.join(', ')}`,
				);
			}

			return this.resultOk(
				`Successfully created payment events and contributions for transaction IDs: ${bankContributions.map((c) => c.transaction_id).join(', ')}`,
			);
		} catch (error) {
			this.logger.error(`Error creating contributions from payment file: ${error}`);
			return this.resultFail(`Error creating contributions from payment file: ${error}`);
		}
	}
	private getContributorPaymentReferenceId = (referenceId: string) => referenceId.slice(7, 20);
}

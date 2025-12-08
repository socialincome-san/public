import { Currency } from '@/lib/types/currency';
import { ContributionStatus, PaymentEvent, PaymentEventType } from '@prisma/client';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import xmldom from '@xmldom/xmldom';
import fs from 'node:fs';
import SFTPClient from 'ssh2-sftp-client';
import { withFile } from 'tmp-promise';
import xpath from 'xpath';
import {
	CONTRIBUTION_REFERENCE_ID_LENGTH,
	CONTRIBUTOR_REFERENCE_ID_LENGTH,
} from '../bank-transfer/bank-transfer-config';
import { CampaignService } from '../campaign/campaign.service';
import { ContributionService } from '../contribution/contribution.service';
import { PaymentEventCreateInput } from '../contribution/contribution.types';
import { ContributorService } from '../contributor/contributor.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { BankContribution } from './payment-file-import.types';

const POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64 = process.env.POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64!;
const POSTFINANCE_FTP_HOST = process.env.POSTFINANCE_FTP_HOST!;
const POSTFINANCE_FTP_PORT = process.env.POSTFINANCE_FTP_PORT!;
const POSTFINANCE_FTP_USER = process.env.POSTFINANCE_FTP_USER!;

export class PaymentFileImportService extends BaseService {
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
	async importPaymentFiles(): Promise<ServiceResult<PaymentEvent[]>> {
		const sftp = new SFTPClient();
		const bucket = this.storageAdmin.storage.bucket(this.bucketName);
		const bucketFiles = (await bucket.getFiles())[0].map((file) => file.name);
		const allContributions: BankContribution[] = [];
		try {
			await sftp.connect({
				host: POSTFINANCE_FTP_HOST,
				port: Number(POSTFINANCE_FTP_PORT),
				username: POSTFINANCE_FTP_USER,
				privateKey: atob(POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64),
			});
			const sftpFiles = await sftp.list('/yellow-net-reports');

			for (let file of sftpFiles) {
				if (bucketFiles.includes(file.name)) {
					this.logger.info(`Skipped copying file ${file.name} because it already exists in ${this.bucketName} bucket`);
					continue;
				}

				await withFile(async ({ path: tmpPath }) => {
					await sftp.get(`/yellow-net-reports/${file.name}`, tmpPath);
					if (!file.name.startsWith('camt.054_P_')) {
						this.logger.info(
							`Skipped processing ${file.name} because it does not contain relevant payment data. Storing anyway.`,
						);
					} else {
						this.logger.info(`Importing contributions from file ${file.name}.`);
						const contributions = this.getContributionsFromPaymentFile(tmpPath);
						allContributions.push(...contributions);
					}
					await this.storageAdmin.uploadFile({ bucket, sourceFilePath: tmpPath, destinationFilePath: file.name });
				});
			}
			const result = await this.createOrUpdateContributions(allContributions);
			sftp.end();

			if (!result.success) {
				this.logger.error(`Error importing payment files: ${result.error}`);
				return this.resultFail(`Error importing payment files: ${result.error}`);
			}
			return this.resultOk(result.data);
		} catch (error) {
			this.logger.error(`Error importing payment files: ${error}`);
			return this.resultFail(`Error importing payment files: ${error}`);
		} finally {
			sftp.end();
		}
	}

	/**
	 * gets the contributions information from the payment file
	 * @param file The path of the file to process
	 */
	private getContributionsFromPaymentFile(file: string): BankContribution[] {
		const xml = fs.readFileSync(file, 'utf8');
		const xmlDoc = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
		const select = xpath.useNamespaces({ ns: 'urn:iso:std:iso:20022:tech:xsd:camt.054.001.08' });
		const nodes = select(this.xmlSelectExpression, xmlDoc) as Node[];

		const contributions: BankContribution[] = [];

		for (let node of nodes) {
			const referenceId = select('string(//ns:RmtInf/ns:Strd/ns:CdtrRefInf/ns:Ref)', node) as string;

			if (!referenceId) {
				this.logger.alert(`Skipped processing a payment entry without reference ID. Raw content: ${node.toString()}`);
				continue;
			}

			contributions.push({
				referenceId,
				amount: parseFloat(select('string(//ns:Amt)', node) as string),
				currency: (select('string(//ns:Amt/@Ccy)', node) as string).toUpperCase() as Currency,
				rawContent: node.toString(),
			});
		}
		return contributions;
	}

	/**
	 * creates payment events and contributions in DB
	 * @param bankContributions contributions from payment files
	 */
	// TODO: create or update
	private async createOrUpdateContributions(
		bankContributions: BankContribution[],
	): Promise<ServiceResult<PaymentEvent[]>> {
		try {
			const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
			if (!fallbackCampaignResult.success) {
				return this.resultFail(fallbackCampaignResult.error);
			}
			const campaignId = fallbackCampaignResult.data.id;

			const contributors = await this.contributorService.findByPaymentReferenceIds(
				bankContributions.map((c) => this.getReferenceIds(c.referenceId).contributorReferenceId),
			);
			if (!contributors.success) {
				return this.resultFail(`Error creating contributions from payment file`);
			}

			const failedPaymentEvents = [];

			const created = [];

			for (let c of bankContributions) {
				const contributor = contributors.data.find(
					(contributor) =>
						contributor.paymentReferenceId === this.getReferenceIds(c.referenceId).contributorReferenceId,
				);
				if (!contributor) {
					this.logger.alert(
						`Contributor for reference ID ${this.getReferenceIds(c.referenceId).contributorReferenceId} does not exist`,
					);
					continue;
				}

				const contributionReferenceId = this.getReferenceIds(c.referenceId).contributionReferenceId;

				if (!contributionReferenceId) {
					this.logger.info(`Legacy reference ID detected for contributor ${contributor.id}.`);
				}

				const paymentEvent: PaymentEventCreateInput = {
					type: PaymentEventType.bank_transfer,
					transactionId: contributionReferenceId || '',
					metadata: {
						raw_content: c.rawContent,
					},
					contribution: {
						create: {
							amount: c.amount,
							amountChf: c.amount,
							currency: c.currency,
							feesChf: 0,
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
					const result = await this.contributionService.upsertFromBankTransfer(paymentEvent);
					if (!result.success) failedPaymentEvents.push(contributionReferenceId);
					else created.push(result.data);
				} catch (error) {
					failedPaymentEvents.push(contributionReferenceId);
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

			return this.resultOk(created);
		} catch (error) {
			this.logger.error(`Error creating contributions from payment file: ${error}`);
			return this.resultFail(`Error creating contributions from payment file: ${error}`);
		}
	}
	private getReferenceIds = (
		referenceId: string,
	): { contributorReferenceId: string; contributionReferenceId: string | undefined } => {
		// Old reference IDs without contribution reference ID
		const isLegacyReferenceId = referenceId.startsWith('0000000');

		if (isLegacyReferenceId) {
			return { contributorReferenceId: referenceId.slice(7, 20), contributionReferenceId: undefined };
		}

		const startIndex = 3;

		return {
			contributorReferenceId: referenceId.slice(startIndex, startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH),
			contributionReferenceId: referenceId.slice(
				startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH,
				startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH + CONTRIBUTION_REFERENCE_ID_LENGTH,
			),
		};
	};
}

import { ContributionStatus, PaymentEvent, PaymentEventType } from '@prisma/client';
import { StorageAdmin } from '@socialincome/shared/src/firebase/admin/StorageAdmin';
import { Currency } from '@socialincome/shared/src/types/currency';
import xmldom from '@xmldom/xmldom';
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

const POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64 = process.env.POSTFINANCE_FTP_RSA_PRIVATE_KEY_BASE64!;
const POSTFINANCE_FTP_HOST = process.env.POSTFINANCE_FTP_HOST!;
const POSTFINANCE_FTP_PORT = process.env.POSTFINANCE_FTP_PORT!;
const POSTFINANCE_FTP_USER = process.env.POSTFINANCE_FTP_USER!;

type BankContribution = {
	amount: number;
	currency: string;
	referenceId: string;
	transactionId: string;
	rawContent: string;
};

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
						const contributions = this.getContributionsFromPaymentFile(tmpPath);
						allContributions.push(...contributions);
					}
					await this.storageAdmin.uploadFile({ bucket, sourceFilePath: tmpPath, destinationFilePath: file.name });
				});
			}
			const result = await this.createContributions(allContributions);
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
			const transactionId = select('string(//ns:Refs/ns:EndToEndId)', node) as string;
			const referenceId = select('string(//ns:RmtInf/ns:Strd/ns:CdtrRefInf/ns:Ref)', node) as string;

			// TODO: check reference ID in contributor

			contributions.push({
				referenceId,
				transactionId,
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
	private async createContributions(bankContributions: BankContribution[]): Promise<ServiceResult<PaymentEvent[]>> {
		try {
			const fallbackCampaignResult = await this.campaignService.getFallbackCampaign();
			if (!fallbackCampaignResult.success) {
				return this.resultFail(fallbackCampaignResult.error);
			}
			const campaignId = fallbackCampaignResult.data.id;

			const contributors = await this.contributorService.findByPaymentReferenceIds(
				bankContributions.map((c) => this.getContributorPaymentReferenceId(c.referenceId)),
			);
			if (!contributors.success) {
				return this.resultFail(`Error creating contributions from payment file`);
			}

			const failedPaymentEvents = [];

			const created = [];

			for (let c of bankContributions) {
				const contributor = contributors.data.find(
					(contributor) => contributor.paymentReferenceId === this.getContributorPaymentReferenceId(c.referenceId),
				);
				if (!contributor) {
					this.logger.alert(`Contributor for reference ID ${c.referenceId} does not exist`);
					continue;
				}

				const paymentEvent: PaymentEventCreateInput = {
					type: PaymentEventType.bank_transfer,
					transactionId: c.transactionId || '',
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
					const result = await this.contributionService.createContributionWithPaymentEvent(paymentEvent);
					if (!result.success) failedPaymentEvents.push(c.transactionId);
					else created.push(result.data);
				} catch (error) {
					failedPaymentEvents.push(c.transactionId);
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
	private getContributorPaymentReferenceId = (referenceId: string) => referenceId.slice(7, 20);
}

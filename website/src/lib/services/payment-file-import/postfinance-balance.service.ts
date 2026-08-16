import { Currency, type PrismaClient } from '@/generated/prisma/client';
import { storageAdmin } from '@/lib/firebase/firebase-admin';
import { logger } from '@/lib/utils/logger';
import xmldom from '@xmldom/xmldom';
import { type Storage } from 'firebase-admin/storage';
import xpath from 'xpath';
import { BaseService } from '../core/base.service';
import { type ServiceResult } from '../core/base.types';
import { type PostFinanceBalance } from './postfinance-balance.types';

type XPathSelectableNode = Parameters<typeof xpath.select>[1];
type StorageBucket = ReturnType<Storage['bucket']>;
type StorageFile = ReturnType<StorageBucket['file']>;

type DatedStorageFile = {
	file: StorageFile;
	updatedAt: number;
};

const balanceTypePreference = ['CLAV', 'CLBD', 'ITAV', 'ITBD'] as const;

export class PostFinanceBalanceService extends BaseService {
	private readonly bucket?: StorageBucket;

	constructor(bucketName: string, db: PrismaClient, loggerInstance = logger, bucket?: StorageBucket) {
		super(db, loggerInstance);
		this.bucket = bucket ?? (bucketName ? storageAdmin.storage.bucket(bucketName) : undefined);
	}

	async getLatestBalances(ibans: string[]): Promise<ServiceResult<PostFinanceBalance[]>> {
		if (!this.bucket) {
			return this.resultFail('PostFinance payments files bucket is not configured');
		}

		const requestedIbans = new Set(ibans.map(this.normalizeIban));
		if (requestedIbans.size === 0) {
			return this.resultOk([]);
		}

		try {
			const files = await this.getCamt052Files(this.bucket);
			if (files.length === 0) {
				return this.resultFail('No CAMT.052 files found');
			}

			const balancesByIban = new Map<string, PostFinanceBalance>();
			for (const { file } of files) {
				const [contents] = await file.download();
				const result = this.getBalancesFromXml(contents.toString('utf8'));
				if (!result.success) {
					return result;
				}

				for (const balance of result.data) {
					const iban = this.normalizeIban(balance.iban);
					if (requestedIbans.has(iban) && !balancesByIban.has(iban)) {
						balancesByIban.set(iban, { ...balance, iban });
					}
				}

				if (balancesByIban.size === requestedIbans.size) {
					break;
				}
			}

			const missingIbans = [...requestedIbans].filter((iban) => !balancesByIban.has(iban));
			if (missingIbans.length > 0) {
				return this.resultFail(`No balance found for PostFinance accounts: ${missingIbans.join(', ')}`);
			}

			return this.resultOk([...balancesByIban.values()]);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not get PostFinance balances: ${JSON.stringify(error)}`);
		}
	}

	getBalancesFromXml(xml: string): ServiceResult<PostFinanceBalance[]> {
		try {
			const document = new xmldom.DOMParser().parseFromString(xml, 'text/xml');
			const namespace = document.documentElement?.namespaceURI;
			if (!namespace?.includes(':camt.052.')) {
				return this.resultFail('File is not a CAMT.052 document');
			}

			const selectedReports = xpath.select(
				"//*[local-name()='BkToCstmrAcctRpt']/*[local-name()='Rpt']",
				document as unknown as XPathSelectableNode,
			);
			if (!Array.isArray(selectedReports)) {
				return this.resultFail('Could not find reports in CAMT.052 file');
			}

			const balances: PostFinanceBalance[] = [];

			for (const report of selectedReports) {
				const iban = this.normalizeIban(
					this.selectString("string(./*[local-name()='Acct']/*[local-name()='Id']/*[local-name()='IBAN'])", report),
				);
				let balance: ReturnType<typeof xpath.select1> | undefined;
				for (const balanceType of balanceTypePreference) {
					const selectedBalance = xpath.select1(
						`./*[local-name()='Bal'][./*[local-name()='Tp']/*[local-name()='CdOrPrtry']/*[local-name()='Cd']='${balanceType}'][last()]`,
						report,
					);
					if (selectedBalance && typeof selectedBalance === 'object') {
						balance = selectedBalance;
						break;
					}
				}
				if (!iban || !balance || typeof balance !== 'object') {
					continue;
				}

				const amountValue = this.selectString("string(./*[local-name()='Amt'])", balance);
				const currencyValue = this.selectString("string(./*[local-name()='Amt']/@Ccy)", balance).toUpperCase();
				const creditDebitIndicator = this.selectString("string(./*[local-name()='CdtDbtInd'])", balance);
				const amount = Number(amountValue);

				if (
					!amountValue.trim() ||
					!Number.isFinite(amount) ||
					amount < 0 ||
					!this.isCurrency(currencyValue) ||
					(creditDebitIndicator !== 'CRDT' && creditDebitIndicator !== 'DBIT')
				) {
					return this.resultFail(`Invalid balance for PostFinance account ${iban}`);
				}

				balances.push({
					iban,
					amount: creditDebitIndicator === 'DBIT' ? -Math.abs(amount) : amount,
					currency: currencyValue,
				});
			}

			return this.resultOk(balances);
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not parse CAMT.052 file: ${JSON.stringify(error)}`);
		}
	}

	private async getCamt052Files(bucket: StorageBucket): Promise<DatedStorageFile[]> {
		const [files] = await bucket.getFiles();
		const camtFiles = files.filter((file) => /camt\.052/i.test(file.name));
		const datedFiles = await Promise.all(
			camtFiles.map(async (file) => {
				const [metadata] = await file.getMetadata();

				return {
					file,
					updatedAt: Date.parse(metadata.updated ?? metadata.timeCreated ?? ''),
				};
			}),
		);

		return datedFiles.sort(
			(left, right) =>
				(Number.isNaN(right.updatedAt) ? 0 : right.updatedAt) - (Number.isNaN(left.updatedAt) ? 0 : left.updatedAt) ||
				right.file.name.localeCompare(left.file.name),
		);
	}

	private normalizeIban = (iban: string): string => iban.replaceAll(/\s/g, '').toUpperCase();

	private selectString(expression: string, node: XPathSelectableNode): string {
		const value = xpath.select1(expression, node);

		return typeof value === 'string' ? value : '';
	}

	private isCurrency = (value: string): value is Currency => Object.values(Currency).some((currency) => currency === value);
}

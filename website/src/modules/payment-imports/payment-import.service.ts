import { ContributionStatus, Currency, PaymentEventType } from '@/generated/prisma/enums';
import {
	downloadFirebaseStorageFile,
	listFirebaseStorageFileNames,
	listFirebaseStorageFiles,
	uploadBufferToFirebaseStorage,
} from '@/integrations/firebase/firebase-storage.integration';
import {
	downloadPostFinanceReports,
	listPostFinanceReportFileNames,
} from '@/integrations/postfinance/postfinance-sftp.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import { upsertFromBankTransfer } from '@/modules/contributions/contribution.service';
import type { BankTransferUpsertInput, PaymentEventRecord } from '@/modules/contributions/contribution.types';
import { findContributorsByPaymentReferenceIds } from '@/modules/contributors/contributor.service';
import { parseQrBillReference } from '@/modules/qr-bills/qr-bill-reference.service';
import type { QrBillReferenceParts } from '@/modules/qr-bills/qr-bill.types';
import { DOMParser, XMLSerializer, type Element, type Node as XmlNode } from '@xmldom/xmldom';
import { DateTime } from 'luxon';
import { paymentImportBucketSchema } from './payment-import.schemas';
import type { BankContribution, PostFinanceBalance } from './payment-import.types';

export const importPaymentFiles = async (bucketName: string): Promise<ServiceResult<PaymentEventRecord[]>> => {
	const bucketResult = paymentImportBucketSchema.safeParse(bucketName);
	if (!bucketResult.success) {
		return resultFail('PostFinance payments files bucket is not configured');
	}

	const storedFilesResult = await listFirebaseStorageFileNames(bucketResult.data);
	if (!storedFilesResult.success) {
		return resultFail('Error importing payment files');
	}

	const reportNamesResult = await listPostFinanceReportFileNames();
	if (!reportNamesResult.success) {
		return resultFail('Error importing payment files');
	}

	const storedFileNames = new Set(storedFilesResult.data);
	const newReportNames = reportNamesResult.data.filter((name) => {
		if (!storedFileNames.has(name)) {
			return true;
		}

		console.info(`Skipped copying file ${name} because it already exists in ${bucketResult.data} bucket`);

		return false;
	});
	const reportsResult = await downloadPostFinanceReports(newReportNames);
	if (!reportsResult.success) {
		return resultFail('Error importing payment files');
	}

	const allContributions: BankContribution[] = [];
	for (const report of reportsResult.data) {
		if (!report.name.startsWith('camt.054_P_')) {
			console.info(`Skipped processing ${report.name} because it does not contain relevant payment data. Storing anyway.`);
		} else {
			console.info(`Importing contributions from file ${report.name}.`);
			const contributionsResult = parseCamt054Contributions(report.contents.toString('utf8'));
			if (!contributionsResult.success) {
				return resultFail('Error importing payment files');
			}
			allContributions.push(...contributionsResult.data);
		}

		const uploadResult = await uploadBufferToFirebaseStorage(bucketResult.data, report.contents, report.name);
		if (!uploadResult.success) {
			return resultFail('Error importing payment files');
		}
	}

	return createOrUpdateContributions(allContributions);
};

export const parseCamt054Contributions = (xml: string): ServiceResult<BankContribution[]> => {
	try {
		const document = new DOMParser().parseFromString(xml, 'text/xml');
		const transactionDetails = findDescendants(document, 'TxDtls');
		const contributions: BankContribution[] = [];

		for (const transaction of transactionDetails) {
			const referenceId = getNodeText(findDescendantPath(transaction, ['RmtInf', 'Strd', 'CdtrRefInf', 'Ref']));
			const rawContent = new XMLSerializer().serializeToString(transaction);
			if (!referenceId) {
				console.error(`${SLACK_ALERT}: Skipped processing a payment entry without reference ID. Raw content: ${rawContent}`);
				continue;
			}

			const entry = findAncestor(transaction, 'Ntry');
			const amountNode = entry ? findDirectChild(entry, 'Amt') : undefined;
			const amount = Number.parseFloat(getNodeText(amountNode));
			const currencyAttribute = amountNode?.getAttribute('Ccy');
			const currency = parseCurrency(currencyAttribute ? currencyAttribute.toUpperCase() : 'CHF');
			if (!currency) {
				return resultFail('Could not parse payment file');
			}

			contributions.push({
				referenceId,
				amount,
				currency,
				rawContent,
			});
		}

		return resultOk(contributions);
	} catch (error) {
		console.error('Could not parse CAMT.054 payment file', { error });

		return resultFail('Could not parse payment file');
	}
};

export const getLatestPostFinanceBalances = async (
	bucketName: string,
	ibans: string[],
): Promise<ServiceResult<PostFinanceBalance[]>> => {
	const bucketResult = paymentImportBucketSchema.safeParse(bucketName);
	if (!bucketResult.success) {
		return resultFail('PostFinance payments files bucket is not configured');
	}

	const requestedIbans = new Set(ibans.map(normalizeIban));
	if (requestedIbans.size === 0) {
		return resultOk([]);
	}

	const filesResult = await listFirebaseStorageFiles(bucketResult.data, /camt\.052/i);
	if (!filesResult.success) {
		return resultFail('Could not get PostFinance balances');
	}

	const files = filesResult.data
		.filter(({ name }) => /camt\.052/i.test(name))
		.map((file) => ({
			...file,
			updatedAt: Date.parse(file.updated ?? file.timeCreated ?? ''),
		}))
		.sort(
			(left, right) =>
				(Number.isNaN(right.updatedAt) ? 0 : right.updatedAt) - (Number.isNaN(left.updatedAt) ? 0 : left.updatedAt) ||
				right.name.localeCompare(left.name),
		);
	if (files.length === 0) {
		return resultFail('No CAMT.052 files found');
	}

	const balancesByIban = new Map<string, PostFinanceBalance>();
	for (const file of files) {
		const contentsResult = await downloadFirebaseStorageFile(bucketResult.data, file.name);
		if (!contentsResult.success) {
			return resultFail('Could not get PostFinance balances');
		}

		const balancesResult = parseCamt052Balances(contentsResult.data.toString('utf8'));
		if (!balancesResult.success) {
			return balancesResult;
		}

		for (const balance of balancesResult.data) {
			const iban = normalizeIban(balance.iban);
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
		return resultFail(`No balance found for PostFinance accounts: ${missingIbans.join(', ')}`);
	}

	return resultOk([...balancesByIban.values()]);
};

export const parseCamt052Balances = (xml: string): ServiceResult<PostFinanceBalance[]> => {
	try {
		const document = new DOMParser().parseFromString(xml, 'text/xml');
		if (!document.documentElement?.namespaceURI?.includes(':camt.052.')) {
			return resultFail('File is not a CAMT.052 document');
		}

		const reports = findDescendants(document, 'Rpt').filter((report) => report.parentNode?.localName === 'BkToCstmrAcctRpt');
		const balances: PostFinanceBalance[] = [];
		for (const report of reports) {
			const iban = normalizeIban(getNodeText(findDescendantPath(report, ['Acct', 'Id', 'IBAN'])));
			const balance = findPreferredBalance(report);
			if (!iban || !balance) {
				continue;
			}

			const amountNode = findDirectChild(balance, 'Amt');
			const amountValue = getNodeText(amountNode);
			const amount = Number(amountValue);
			const currency = parseCurrency(amountNode?.getAttribute('Ccy')?.toUpperCase() ?? '');
			const creditDebitIndicator = getNodeText(findDirectChild(balance, 'CdtDbtInd'));
			if (
				!amountValue.trim() ||
				!Number.isFinite(amount) ||
				amount < 0 ||
				!currency ||
				(creditDebitIndicator !== 'CRDT' && creditDebitIndicator !== 'DBIT')
			) {
				return resultFail(`Invalid balance for PostFinance account ${iban}`);
			}

			balances.push({
				iban,
				amount: creditDebitIndicator === 'DBIT' ? -Math.abs(amount) : amount,
				currency,
			});
		}

		return resultOk(balances);
	} catch (error) {
		console.error('Could not parse CAMT.052 file', { error });

		return resultFail('Could not parse CAMT.052 file');
	}
};

const createOrUpdateContributions = async (
	bankContributions: BankContribution[],
): Promise<ServiceResult<PaymentEventRecord[]>> => {
	try {
		const fallbackCampaignResult = await getFallbackCampaign();
		if (!fallbackCampaignResult.success) {
			return resultFail(fallbackCampaignResult.error);
		}

		const referenceIds: QrBillReferenceParts[] = [];
		for (const { referenceId } of bankContributions) {
			const referenceResult = parseQrBillReference(referenceId);
			if (!referenceResult.success) {
				return resultFail('Error creating contributions from payment file');
			}
			referenceIds.push(referenceResult.data);
		}
		const contributorsResult = await findContributorsByPaymentReferenceIds(
			referenceIds.map(({ contributorReferenceId }) => contributorReferenceId),
		);
		if (!contributorsResult.success) {
			return resultFail('Error creating contributions from payment file');
		}

		const failedPaymentEvents: (string | undefined)[] = [];
		const created: PaymentEventRecord[] = [];
		for (const contribution of bankContributions) {
			const referenceResult = parseQrBillReference(contribution.referenceId);
			if (!referenceResult.success) {
				return resultFail('Error creating contributions from payment file');
			}
			const { contributorReferenceId, contributionReferenceId } = referenceResult.data;
			const contributor = contributorsResult.data.find(
				({ paymentReferenceId }) => paymentReferenceId === contributorReferenceId,
			);
			if (!contributor) {
				console.error(`${SLACK_ALERT}: Contributor for reference ID ${contributorReferenceId} does not exist`);
				continue;
			}
			if (!contributionReferenceId) {
				console.info(`Legacy reference ID detected for contributor ${contributor.id}.`);
			}

			const paymentEvent: BankTransferUpsertInput = {
				type: PaymentEventType.bank_transfer,
				transactionId:
					contributionReferenceId && contributionReferenceId.length > 0
						? contributionReferenceId
						: `${DateTime.now().toMillis()}-legacy`,
				metadata: {
					raw_content: contribution.rawContent,
				},
				contribution: {
					amount: contribution.amount,
					amountChf: contribution.amount,
					currency: contribution.currency,
					feesChf: 0,
					status: ContributionStatus.succeeded,
					campaignId: fallbackCampaignResult.data.id,
					contributorId: contributor.id,
				},
			};
			try {
				const paymentEventResult = await upsertFromBankTransfer(paymentEvent);
				if (!paymentEventResult.success) {
					failedPaymentEvents.push(contributionReferenceId);
				} else {
					created.push(paymentEventResult.data);
				}
			} catch (error) {
				console.error('Could not create payment event from payment file', {
					contributionReferenceId,
					error,
				});
				failedPaymentEvents.push(contributionReferenceId);
			}
		}

		if (failedPaymentEvents.length > 0) {
			console.error('Failed to create payment events with contributions in payment file imports', {
				failedTransactionIds: failedPaymentEvents,
			});

			return resultFail(
				`Failed to create payment events with contributions. Failed transaction IDs: ${failedPaymentEvents.join(', ')}`,
			);
		}

		return resultOk(created);
	} catch (error) {
		console.error('Error creating contributions from payment file', { error });

		return resultFail('Error creating contributions from payment file');
	}
};

const findPreferredBalance = (report: XmlNode): Element | undefined => {
	const balances = getDirectChildren(report, 'Bal');
	for (const balanceType of BALANCE_TYPE_PREFERENCE) {
		const match = balances.findLast(
			(balance) => getNodeText(findDescendantPath(balance, ['Tp', 'CdOrPrtry', 'Cd'])) === balanceType,
		);
		if (match) {
			return match;
		}
	}

	return undefined;
};

const findDescendantPath = (node: XmlNode, names: string[]): Element | undefined => {
	let current: XmlNode | undefined = node;
	for (const name of names) {
		current = current ? findDirectChild(current, name) : undefined;
		if (!current) {
			return undefined;
		}
	}

	return isElement(current) ? current : undefined;
};

const findDirectChild = (node: XmlNode, localName: string): Element | undefined => getDirectChildren(node, localName)[0];

const getDirectChildren = (node: XmlNode, localName?: string): Element[] => {
	const children: Element[] = [];
	for (let index = 0; index < node.childNodes.length; index++) {
		const child = node.childNodes.item(index);
		if (child && isElement(child) && (!localName || child.localName === localName)) {
			children.push(child);
		}
	}

	return children;
};

const findDescendants = (node: XmlNode, localName: string): Element[] => {
	const descendants: Element[] = [];
	for (const child of getDirectChildren(node)) {
		if (child.localName === localName) {
			descendants.push(child);
		}
		descendants.push(...findDescendants(child, localName));
	}

	return descendants;
};

const findAncestor = (node: XmlNode, localName: string): Element | undefined => {
	let current = node.parentNode;
	while (current) {
		if (isElement(current) && current.localName === localName) {
			return current;
		}
		current = current.parentNode;
	}

	return undefined;
};

const isElement = (node: XmlNode): node is Element => node.nodeType === 1;

const getNodeText = (node: XmlNode | undefined): string => node?.textContent?.trim() ?? '';

const parseCurrency = (value: string): Currency | undefined =>
	Object.values(Currency).find((currency) => currency === value);

const normalizeIban = (iban: string): string => iban.replaceAll(/\s/g, '').toUpperCase();

const BALANCE_TYPE_PREFERENCE = ['CLAV', 'CLBD', 'ITAV', 'ITBD'];

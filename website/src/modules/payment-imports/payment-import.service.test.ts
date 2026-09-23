import { ContributorReferralSource, PaymentEventType } from '@/generated/prisma/enums';
import {
	listFirebaseStorageFileNames,
	uploadBufferToFirebaseStorage,
} from '@/integrations/firebase/firebase-storage.integration';
import {
	downloadPostFinanceReports,
	listPostFinanceReportFileNames,
} from '@/integrations/postfinance/postfinance-sftp.integration';
import { getFallbackCampaign } from '@/modules/campaigns/campaign.service';
import { upsertFromBankTransfer } from '@/modules/contributions/contribution.service';
import type { PaymentEventRecord } from '@/modules/contributions/contribution.types';
import { findContributorsByPaymentReferenceIds } from '@/modules/contributors/contributor.service';
import { importPaymentFiles, parseCamt054Contributions } from './payment-import.service';

jest.mock('@/integrations/firebase/firebase-storage.integration', () => ({
	downloadFirebaseStorageFile: jest.fn(),
	listFirebaseStorageFileNames: jest.fn(),
	listFirebaseStorageFiles: jest.fn(),
	uploadBufferToFirebaseStorage: jest.fn(),
}));
jest.mock('@/integrations/postfinance/postfinance-sftp.integration', () => ({
	downloadPostFinanceReports: jest.fn(),
	listPostFinanceReportFileNames: jest.fn(),
}));
jest.mock('@/modules/campaigns/campaign.service', () => ({
	getFallbackCampaign: jest.fn(),
}));
jest.mock('@/modules/contributions/contribution.service', () => ({
	upsertFromBankTransfer: jest.fn(),
}));
jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorsByPaymentReferenceIds: jest.fn(),
}));
jest.mock('@/modules/qr-bills/qr-bill-reference.service', () => ({
	parseQrBillReference: (referenceId: string) => ({
		success: true,
		data: referenceId.startsWith('0000000')
			? {
					contributorReferenceId: referenceId.slice(7, 20),
					contributionReferenceId: undefined,
				}
			: {
					contributorReferenceId: referenceId.slice(3, 16),
					contributionReferenceId: referenceId.slice(16, 26),
				},
	}),
}));

const camt054TwoEntries = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08">
	<BkToCstmrDbtCdtNtfctn>
		<Ntfctn>
			<Ntry>
				<Amt Ccy="CHF">30.00</Amt>
				<NtryDtls>
					<TxDtls>
						<RmtInf><Strd><CdtrRefInf><Ref>000000017368904740340000019</Ref></CdtrRefInf></Strd></RmtInf>
					</TxDtls>
				</NtryDtls>
			</Ntry>
			<Ntry>
				<Amt Ccy="CHF">2.00</Amt>
				<NtryDtls>
					<TxDtls>
						<RmtInf><Strd><CdtrRefInf><Ref>000176590200045017659021118</Ref></CdtrRefInf></Strd></RmtInf>
					</TxDtls>
				</NtryDtls>
			</Ntry>
		</Ntfctn>
	</BkToCstmrDbtCdtNtfctn>
</Document>`;

describe('parseCamt054Contributions', () => {
	test('extracts two contributions with the correct reference and amount per entry', () => {
		const result = parseCamt054Contributions(camt054TwoEntries);

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}

		expect(result.data).toHaveLength(2);
		expect(result.data[0]).toMatchObject({
			referenceId: '000000017368904740340000019',
			amount: 30,
			currency: 'CHF',
		});
		expect(result.data[1]).toMatchObject({
			referenceId: '000176590200045017659021118',
			amount: 2,
			currency: 'CHF',
		});
	});
});

describe('importPaymentFiles', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	test('skips stored reports, imports matching contributions, and archives every new report', async () => {
		const existingReportName = 'camt.054_P_existing.xml';
		const paymentReportName = 'camt.054_P_new.xml';
		const balanceReportName = 'camt.052_new.xml';
		const referenceId = '000176590200045017659021118';
		const contributorReferenceId = referenceId.slice(3, 16);
		const contributionReferenceId = referenceId.slice(16, 26);
		const paymentContents = Buffer.from(camt054TwoEntries.replace('000000017368904740340000019', referenceId));
		const balanceContents = Buffer.from('<Document />');
		const paymentEvent: PaymentEventRecord = {
			id: 'payment-event-id',
			type: PaymentEventType.bank_transfer,
			transactionId: contributionReferenceId,
			contributionId: 'contribution-id',
			createdAt: new Date('2026-01-16T00:00:00Z'),
			updatedAt: null,
		};
		jest.mocked(listFirebaseStorageFileNames).mockResolvedValue({
			success: true,
			data: [existingReportName],
		});
		jest.mocked(listPostFinanceReportFileNames).mockResolvedValue({
			success: true,
			data: [existingReportName, paymentReportName, balanceReportName],
		});
		jest.mocked(downloadPostFinanceReports).mockResolvedValue({
			success: true,
			data: [
				{ name: paymentReportName, contents: paymentContents },
				{ name: balanceReportName, contents: balanceContents },
			],
		});
		jest.mocked(uploadBufferToFirebaseStorage).mockResolvedValue({ success: true, data: undefined });
		jest.mocked(getFallbackCampaign).mockResolvedValue({
			success: true,
			data: {
				id: 'fallback-campaign-id',
				slug: null,
				endDate: new Date('2026-12-31T00:00:00Z'),
				programId: 'program-id',
			},
		});
		jest.mocked(findContributorsByPaymentReferenceIds).mockResolvedValue({
			success: true,
			data: [
				{
					id: 'contributor-id',
					legacyFirestoreId: null,
					accountId: 'account-id',
					contactId: 'contact-id',
					referral: ContributorReferralSource.other,
					needsOnboarding: false,
					paymentReferenceId: contributorReferenceId,
					stripeCustomerId: null,
					createdAt: new Date('2026-01-01T00:00:00Z'),
					updatedAt: null,
					contact: {
						id: 'contact-id',
						firstName: 'Test',
						lastName: 'Contributor',
						callingName: null,
						email: null,
						gender: null,
						language: null,
						dateOfBirth: null,
						profession: null,
						phoneId: null,
						addressId: null,
						isInstitution: false,
						createdAt: new Date('2026-01-01T00:00:00Z'),
						updatedAt: null,
						address: null,
					},
				},
			],
		});
		jest.mocked(upsertFromBankTransfer).mockResolvedValue({ success: true, data: paymentEvent });

		await expect(importPaymentFiles('test-bucket')).resolves.toEqual({
			success: true,
			data: [paymentEvent, paymentEvent],
		});
		expect(downloadPostFinanceReports).toHaveBeenCalledWith([paymentReportName, balanceReportName]);
		expect(findContributorsByPaymentReferenceIds).toHaveBeenCalledWith([contributorReferenceId, contributorReferenceId]);
		expect(upsertFromBankTransfer).toHaveBeenCalledTimes(2);
		expect(jest.mocked(upsertFromBankTransfer).mock.calls[0]?.[0]).toMatchObject({
			transactionId: contributionReferenceId,
			contribution: {
				campaignId: 'fallback-campaign-id',
				contributorId: 'contributor-id',
			},
		});
		expect(uploadBufferToFirebaseStorage).toHaveBeenNthCalledWith(1, 'test-bucket', paymentContents, paymentReportName);
		expect(uploadBufferToFirebaseStorage).toHaveBeenNthCalledWith(2, 'test-bucket', balanceContents, balanceReportName);
	});
});

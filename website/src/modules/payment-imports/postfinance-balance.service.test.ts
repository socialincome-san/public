import { downloadFirebaseStorageFile, listFirebaseStorageFiles } from '@/integrations/firebase/firebase-storage.integration';
import { getLatestPostFinanceBalances, parseCamt052Balances } from './payment-import.service';

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

const camt052Balances = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.052.001.08">
	<BkToCstmrAcctRpt>
		<Rpt>
			<Acct><Id><IBAN>CH19 0900 0000 1511 2638 6</IBAN></Id></Acct>
			<Bal>
				<Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
				<Amt Ccy="CHF">100.00</Amt>
				<CdtDbtInd>CRDT</CdtDbtInd>
			</Bal>
			<Bal>
				<Tp><CdOrPrtry><Cd>ITBD</Cd></CdOrPrtry></Tp>
				<Amt Ccy="CHF">1234.56</Amt>
				<CdtDbtInd>CRDT</CdtDbtInd>
			</Bal>
		</Rpt>
		<Rpt>
			<Acct><Id><IBAN>CH9709000000169153887</IBAN></Id></Acct>
			<Bal>
				<Tp><CdOrPrtry><Cd>ITBD</Cd></CdOrPrtry></Tp>
				<Amt Ccy="EUR">100.00</Amt>
				<CdtDbtInd>CRDT</CdtDbtInd>
			</Bal>
			<Bal>
				<Tp><CdOrPrtry><Cd>CLAV</Cd></CdOrPrtry></Tp>
				<Amt Ccy="EUR">42.25</Amt>
				<CdtDbtInd>DBIT</CdtDbtInd>
			</Bal>
		</Rpt>
		<Rpt>
			<Acct><Id><IBAN>CH5709000000154860881</IBAN></Id></Acct>
			<Bal>
				<Tp><CdOrPrtry><Cd>OPBD</Cd></CdOrPrtry></Tp>
				<Amt Ccy="CHF">99.00</Amt>
				<CdtDbtInd>CRDT</CdtDbtInd>
			</Bal>
		</Rpt>
	</BkToCstmrAcctRpt>
</Document>`;

describe('parseCamt052Balances', () => {
	test('extracts preferred balances and normalizes IBANs', () => {
		const result = parseCamt052Balances(camt052Balances);

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}

		expect(result.data).toEqual([
			{
				iban: 'CH1909000000151126386',
				amount: 1234.56,
				currency: 'CHF',
			},
			{
				iban: 'CH9709000000169153887',
				amount: -42.25,
				currency: 'EUR',
			},
		]);
	});

	test('ignores reports with only an opening balance', () => {
		const result = parseCamt052Balances(camt052Balances);

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}

		expect(result.data.some(({ iban }) => iban === 'CH5709000000154860881')).toBe(false);
	});

	test('rejects XML from another CAMT family', () => {
		const result = parseCamt052Balances('<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08"></Document>');

		expect(result).toEqual({ success: false, error: 'File is not a CAMT.052 document' });
	});

	test('rejects balances with an unknown credit/debit indicator', () => {
		const result = parseCamt052Balances(`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.052.001.08">
	<BkToCstmrAcctRpt>
		<Rpt>
			<Acct><Id><IBAN>CH1909000000151126386</IBAN></Id></Acct>
			<Bal>
				<Tp><CdOrPrtry><Cd>CLAV</Cd></CdOrPrtry></Tp>
				<Amt Ccy="CHF">1234.56</Amt>
				<CdtDbtInd>UNKNOWN</CdtDbtInd>
			</Bal>
		</Rpt>
	</BkToCstmrAcctRpt>
</Document>`);

		expect(result).toEqual({
			success: false,
			error: 'Invalid balance in PostFinance CAMT.052 file',
		});
	});

	test('rejects balances with a negative CAMT amount', () => {
		const result = parseCamt052Balances(`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.052.001.08">
	<BkToCstmrAcctRpt>
		<Rpt>
			<Acct><Id><IBAN>CH1909000000151126386</IBAN></Id></Acct>
			<Bal>
				<Tp><CdOrPrtry><Cd>CLAV</Cd></CdOrPrtry></Tp>
				<Amt Ccy="CHF">-10.00</Amt>
				<CdtDbtInd>CRDT</CdtDbtInd>
			</Bal>
		</Rpt>
	</BkToCstmrAcctRpt>
</Document>`);

		expect(result).toEqual({
			success: false,
			error: 'Invalid balance in PostFinance CAMT.052 file',
		});
	});
});

describe('getLatestPostFinanceBalances', () => {
	test('fails when no usable balance exists for a requested IBAN', async () => {
		jest.mocked(listFirebaseStorageFiles).mockResolvedValue({
			success: true,
			data: [
				{
					name: 'camt.052_test.xml',
					updated: '2026-08-12T06:00:00Z',
					timeCreated: undefined,
				},
			],
		});
		jest.mocked(downloadFirebaseStorageFile).mockResolvedValue({
			success: true,
			data: Buffer.from(camt052Balances),
		});

		await expect(getLatestPostFinanceBalances('test-bucket', ['CH5709000000154860881'])).resolves.toEqual({
			success: false,
			error: 'No balance found for one or more PostFinance accounts',
		});
	});
});

import fs from 'node:fs';
import path from 'node:path';
import { PostFinanceBalanceService } from './postfinance-balance.service';

jest.mock('@/lib/firebase/firebase-admin', () => ({
	storageAdmin: {
		storage: {
			bucket: (name: string) => ({ name, getFiles: () => [[]] }),
		},
	},
}));
jest.mock('@/generated/prisma/client', () => ({
	Currency: { CHF: 'CHF', EUR: 'EUR' },
	PrismaClient: class {},
}));

const fixturePath = path.join(path.dirname(__filename), '__fixtures__', 'camt052-balances.xml');

describe('PostFinanceBalanceService.getBalancesFromXml', () => {
	const service = new PostFinanceBalanceService('test-bucket', {} as never);

	test('extracts preferred balances and normalizes IBANs', () => {
		const result = service.getBalancesFromXml(fs.readFileSync(fixturePath, 'utf8'));

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
		const result = service.getBalancesFromXml(fs.readFileSync(fixturePath, 'utf8'));

		expect(result.success).toBe(true);
		if (!result.success) {
			throw new Error(result.error);
		}

		expect(result.data.some(({ iban }) => iban === 'CH5709000000154860881')).toBe(false);
	});

	test('rejects XML from another CAMT family', () => {
		const result = service.getBalancesFromXml(
			'<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.054.001.08"></Document>',
		);

		expect(result).toEqual({ success: false, error: 'File is not a CAMT.052 document' });
	});

	test('rejects balances with an unknown credit/debit indicator', () => {
		const result = service.getBalancesFromXml(`<?xml version="1.0" encoding="UTF-8"?>
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
			error: 'Invalid balance for PostFinance account CH1909000000151126386',
		});
	});

	test('rejects balances with a negative CAMT amount', () => {
		const result = service.getBalancesFromXml(`<?xml version="1.0" encoding="UTF-8"?>
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
			error: 'Invalid balance for PostFinance account CH1909000000151126386',
		});
	});
});

describe('PostFinanceBalanceService.getLatestBalances', () => {
	test('fails when no usable balance exists for a requested IBAN', async () => {
		const file = {
			name: 'camt.052_test.xml',
			getMetadata: jest.fn().mockResolvedValue([{ updated: '2026-08-12T06:00:00Z' }]),
			download: jest.fn().mockResolvedValue([Buffer.from(fs.readFileSync(fixturePath, 'utf8'))]),
		};
		const bucket = {
			getFiles: jest.fn().mockResolvedValue([[file]]),
		};
		const service = new PostFinanceBalanceService('test-bucket', {} as never, bucket as never);

		await expect(service.getLatestBalances(['CH5709000000154860881'])).resolves.toEqual({
			success: false,
			error: 'No balance found for PostFinance accounts: CH5709000000154860881',
		});
	});
});

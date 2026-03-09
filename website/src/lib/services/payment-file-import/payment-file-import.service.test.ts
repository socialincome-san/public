import path from 'node:path';
import { PaymentFileImportService } from './payment-file-import.service';

jest.mock('@/lib/firebase/firebase-admin', () => ({
	storageAdmin: { storage: { bucket: () => ({ getFiles: () => [[]] }) } },
}));
jest.mock('@/generated/prisma/client', () => ({
	PrismaClient: class {},
	ContributionStatus: {},
	PaymentEventType: {},
}));
jest.mock('@/lib/services/contributor/contributor-read.service', () => ({ ContributorReadService: class {} }));
jest.mock('@/lib/services/contribution/contribution-write.service', () => ({ ContributionWriteService: class {} }));
jest.mock('@/lib/services/campaign/campaign-read.service', () => ({ CampaignReadService: class {} }));

const fixturePath = path.join(path.dirname(__filename), '__fixtures__', 'camt054-two-entries.xml');

describe('PaymentFileImportService.getContributionsFromPaymentFile', () => {
	test('extracts two contributions with correct Ref and Amt per entry (real file)', () => {
		const service = new PaymentFileImportService('test-bucket', {} as never, {} as never, {} as never, {} as never);
		const result = service.getContributionsFromPaymentFile(fixturePath);

		expect(result).toHaveLength(2);
		expect(result[0]).toMatchObject({
			referenceId: '000000017368904740340000019',
			amount: 30,
			currency: 'CHF',
		});
		expect(result[1]).toMatchObject({
			referenceId: '000176590200045017659021118',
			amount: 2,
			currency: 'CHF',
		});
	});
});

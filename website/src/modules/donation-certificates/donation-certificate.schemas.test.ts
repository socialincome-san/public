import { donationCertificateBatchCreateSchema, donationCertificateCreateSchema } from './donation-certificate.schemas';

describe('donation certificate schemas', () => {
	test('accepts a valid batch generation request', () => {
		expect(
			donationCertificateBatchCreateSchema.safeParse({
				year: 2025,
				contributorIds: ['contributor-1', 'contributor-2'],
				language: 'fr',
			}).success,
		).toBe(true);
	});

	test('rejects unsupported languages and non-numeric years', () => {
		expect(
			donationCertificateCreateSchema.safeParse({
				year: '2025',
				language: 'es',
			}).success,
		).toBe(false);
	});
});

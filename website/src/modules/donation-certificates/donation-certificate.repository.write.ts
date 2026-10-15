import type { Prisma } from '@/generated/prisma/client';
import type { AuditContext } from '@/lib/audit/audit-types';
import { auditedWrite, defineAuditedEntity } from '@/lib/audit/audited-write';
import type { LanguageCode } from '@/lib/types/language';

// Every write here stores a donation certificate audit event in the same
// transaction. Reads live in donation-certificate.repository.read.ts.

export const createDonationCertificate = async (
	audit: AuditContext,
	input: {
		year: number;
		language: LanguageCode;
		storagePath: string;
		contributorId: string;
	},
) =>
	auditedWrite({ entity: donationCertificateEntity, context: audit, action: 'create' }, (transaction) =>
		transaction.donationCertificate.create({ data: input, select: { id: true } }),
	);

const donationCertificateAuditSnapshotSelect = {
	legacyFirestoreId: true,
	contributorId: true,
	year: true,
	language: true,
	storagePath: true,
} satisfies Prisma.DonationCertificateSelect;

const donationCertificateEntity = defineAuditedEntity({
	type: 'donation-certificate',
	findSnapshot: (transaction, certificateId) =>
		transaction.donationCertificate.findUnique({
			where: { id: certificateId },
			select: donationCertificateAuditSnapshotSelect,
		}),
	getName: ({ year, language }) => `${year} ${language}`,
});

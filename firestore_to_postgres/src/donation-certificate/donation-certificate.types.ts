import { Prisma } from '@prisma/client';
import { DonationCertificate } from '@socialincome/shared/src/types/donation-certificate';
import { User } from '@socialincome/shared/src/types/user';

export const DONATION_CERTIFICATE_FIRESTORE_PATH = 'donation-certificates';
export const USER_FIRESTORE_PATH = 'users';

export type FirestoreUserWithId = User & { id: string; legacyFirestoreId: string };
export type FirestoreDonationCertificateWithUser = {
	certificate: DonationCertificate & { id: string; legacyFirestoreId: string };
	user: FirestoreUserWithId;
};

export type DonationCertificateCreateInput = Prisma.DonationCertificateCreateInput;

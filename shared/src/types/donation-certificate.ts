export const DONATION_CERTIFICATE_FIRESTORE_PATH = 'donation-certificates';

export type DonationCertificate = {
	country: string;
	year: number;
	storage_path: string;
};

export const DONATION_CERTIFICATE_FIRESTORE_PATH = 'donation-certificates';

export type DonationCertificate = {
	url: string;
	country: string;
	year: number;
};

export const DONATION_CERTIFICATE_FIRESTORE_PATH = 'donation-certificate';

export type DonationCertificate = {
	url: string;
	country: string;
	year: number;
};

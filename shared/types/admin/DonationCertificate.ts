export const DONATION_CERTIFICATE_FIRESTORE_PATH = 'donation-certificate';

export type DonationCertificate = {
	created: Date;
	url: string;
	country: string;
	year: string;
};

export const NEWSLETTER_SUBSCRIBER_FIRESTORE_PATH = 'newsletter-subscribers';

export type NewsletterSubscriber = {
	email: string;
	fname: string;
	lname: string;
	gender: string;
	language: string;
	country: string;
	currency: string;
	mc_status: string;
	si_status: string;
};

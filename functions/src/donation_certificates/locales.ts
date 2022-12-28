import * as LOCALES_DE from '../../../shared/locales/de/donation-certificate.json';
import * as LOCALES_EN from '../../../shared/locales/en/donation-certificate.json';
import * as LOCALES_FR from '../../../shared/locales/fr/donation-certificate.json';

export type DonationCertificateLocales = { [key in keyof typeof LOCALES_EN]: string };

export const loadLocales = (language?: string): DonationCertificateLocales => {
	switch (language?.toLowerCase()) {
		case 'de':
			return LOCALES_DE;
		case 'fr':
			return LOCALES_FR;
		case 'en':
			return LOCALES_EN;
		default:
			return LOCALES_EN;
	}
};

export const getEmailTemplate = (language?: string): string => {
	switch (language?.toLowerCase()) {
		case 'de':
			return 'dist/assets/emails/transactional/donation-certificate-email-de.handlebars';
		case 'fr':
			return 'dist/assets/emails/transactional/donation-certificate-email-fr.handlebars';
		case 'en':
			return 'dist/assets/emails/transactional/donation-certificate-email-en.handlebars';
		default:
			return 'dist/assets/emails/transactional/donation-certificate-email-en.handlebars';
	}
};

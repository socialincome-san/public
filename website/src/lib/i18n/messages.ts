import { type WebsiteLanguage } from '@/lib/i18n/utils';
import common from './locales/en/common.json';
import countries from './locales/en/countries.json';
import createProgramWizard from './locales/en/create-program-wizard.json';
import donationCertificate from './locales/en/donation-certificate.json';
import donationWizard from './locales/en/donation-wizard.json';
import websiteCampaign from './locales/en/website-campaign.json';
import websiteCommon from './locales/en/website-common.json';
import websiteCommunity from './locales/en/website-community.json';
import websiteDonate from './locales/en/website-donate.json';
import websiteFaq from './locales/en/website-faq.json';
import websiteHome from './locales/en/website-home.json';
import websiteJournal from './locales/en/website-journal.json';
import websiteLogin from './locales/en/website-login.json';
import websiteMe from './locales/en/website-me.json';
import websiteNewsletter from './locales/en/website-newsletter.json';
import websiteOpenSource from './locales/en/website-open-source.json';
import websiteSurvey from './locales/en/website-survey.json';

const englishMessages = {
	common,
	countries,
	'create-program-wizard': createProgramWizard,
	'donation-certificate': donationCertificate,
	'donation-wizard': donationWizard,
	'website-campaign': websiteCampaign,
	'website-common': websiteCommon,
	'website-community': websiteCommunity,
	'website-donate': websiteDonate,
	'website-faq': websiteFaq,
	'website-home': websiteHome,
	'website-journal': websiteJournal,
	'website-login': websiteLogin,
	'website-me': websiteMe,
	'website-newsletter': websiteNewsletter,
	'website-open-source': websiteOpenSource,
	'website-survey': websiteSurvey,
};

export type Messages = typeof englishMessages;

const isMessageTree = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

// Only keys that exist in English are kept, so the result has the shape of `Messages`.
const withEnglishFallback = (english: Record<string, unknown>, translation: unknown): Record<string, unknown> =>
	Object.fromEntries(
		Object.entries(english).map(([key, englishValue]) => {
			const value = isMessageTree(translation) ? translation[key] : undefined;
			if (isMessageTree(englishValue)) {
				return [key, withEnglishFallback(englishValue, value)];
			}

			return [key, typeof value === 'string' ? value : englishValue];
		}),
	);

const loadNamespace = async (language: WebsiteLanguage, namespace: string): Promise<unknown> => {
	try {
		const imported: unknown = await import(`./locales/${language}/${namespace}.json`);

		return isMessageTree(imported) ? imported.default : undefined;
	} catch {
		// Not every language translates every namespace (e.g. Krio), English fills the gaps.
		return undefined;
	}
};

export const loadMessages = async (language: WebsiteLanguage): Promise<Messages> => {
	if (language === 'en') {
		return englishMessages;
	}

	const translations = await Promise.all(
		Object.keys(englishMessages).map(async (namespace) => [namespace, await loadNamespace(language, namespace)] as const),
	);

	return withEnglishFallback(englishMessages, Object.fromEntries(translations)) as Messages;
};

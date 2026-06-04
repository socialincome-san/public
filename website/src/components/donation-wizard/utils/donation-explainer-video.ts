import type { WebsiteLanguage } from '@/lib/i18n/utils';
import type { LanguageCode } from '@/lib/types/language';

type DonationExplainerVideo = {
	embedUrl: string;
	thumbnailSrc: string;
};

const DONATION_EXPLAINER_THUMBNAIL_SRC = '/assets/donation/explainer-thumbnail.jpg';

const DONATION_EXPLAINER_EMBED_URL_BY_LANGUAGE = {
	en: 'https://player.vimeo.com/video/433937157',
	de: 'https://player.vimeo.com/video/488184818',
	fr: 'https://player.vimeo.com/video/488184818',
	it: 'https://player.vimeo.com/video/433937157',
	kri: 'https://player.vimeo.com/video/433937157',
} satisfies Record<WebsiteLanguage, string>;

const isWebsiteLanguage = (language: LanguageCode): language is WebsiteLanguage =>
	language in DONATION_EXPLAINER_EMBED_URL_BY_LANGUAGE;

export const getDonationExplainerVideo = (language: LanguageCode): DonationExplainerVideo => {
	const embedUrl = isWebsiteLanguage(language)
		? DONATION_EXPLAINER_EMBED_URL_BY_LANGUAGE[language]
		: DONATION_EXPLAINER_EMBED_URL_BY_LANGUAGE.en;

	return {
		embedUrl,
		thumbnailSrc: DONATION_EXPLAINER_THUMBNAIL_SRC,
	};
};

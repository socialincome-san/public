import {
	CountryBadgeType,
	QuoteType,
	RecipientsBadgeType,
	SdgBadgeType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { WebsiteLanguage } from '@/i18n';

type NgoHoverCardType = {
	orgImage: string;
	orgLongName: string;
	partnershipStart: string;
	orgDescriptionParagraphs: {
		text: string;
		href?: string;
	}[][];
	quote?: QuoteType;
	quoteAuthor?: string;
	quotePhoto?: string | null;
	orgFoundation: string;
	orgHeadquarter: string;
	orgWebsite?: string;
	orgFacebook?: string;
	orgInstagram?: string;
	orgLinkedIn?: string;
	orgYoutube?: string;
	orgFundRaiserText?: {
		text: string;
		href?: string;
	}[];
};

type NgoCardProps = {
	orgShortName: string;
	orgMission: string;
	countryBadge: CountryBadgeType;
	recipientsBadge: RecipientsBadgeType;
	sdgBadges: SdgBadgeType[];
	ngoHoverCard: NgoHoverCardType;
	lang: WebsiteLanguage;
};

type NgoEntryJSON = {
	'org-image': string;
	'org-short-name': string;
	'org-long-name': string;
	'org-foundation': string;
	'org-country': string;
	'org-headquarter': string;
	'org-category': string;
	'org-focus-sdg-numbers': number[];
	'partnership-start': string;
	'recipients-total': number;
	'recipients-active': number;
	'recipients-former': number;
	'recipients-suspend': number;
	'org-mission': string;
	'org-description-paragraphs': {
		text: string;
		href?: string;
	}[][];
	'org-quote': [];
	'org-quote-author': string;
	'org-quote-photo': string;
	'org-photo': string;
	'org-website': string;
	'org-instagram': string;
	'org-facebook': string;
	'org-linkedin': string;
	'org-youtube': string;
	'org-fundraiser-text': {
		text: string;
		href?: string;
	}[];
};

type NgoHomeProps = {
	ngoHoverCard: NgoHoverCardType;
	countryBadge: CountryBadgeType;
	recipientsBadge: RecipientsBadgeType;
	orgMission: string;
	countryLongName: string;
	partnerSinceTranslation: string;
	badgeRecipientTranslation: string;
	badgeRecipientTranslationBy: string;
	badgeActiveTranslation: string;
	badgeFormerTranslation: string;
	badgeSuspendedTranslation: string;
	fundRaiserTranslation: string;
	orgShortName: string;
	missionTranslation: string;
	foundedTranslation: string;
	headquarterTranslation: string;
	moreLinksTranslation: string;
	websiteTranslation: string;
	facebookTranslation: string;
	instagramTranslation: string;
	linkedinTranslation: string;
	youtubeTranslation: string;
};

export type { NgoCardProps, NgoEntryJSON, NgoHomeProps, NgoHoverCardType };

import {
	CountryBadgeType,
	QuoteType,
	SdgBadgeType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';

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
	orgSlug: string;
	orgFundRaiserText?: {
		text: string;
		href?: string;
	}[];
};

type NgoCardProps = {
	orgShortName: string;
	orgMission: string;
	countryBadge: CountryBadgeType;
	sdgBadges: SdgBadgeType[];
	ngoHoverCard: NgoHoverCardType;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

type NgoEntryJSON = {
	'org-image': string;
	'org-slug': string;
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
	currentNgo: NgoEntryJSON;
	currentNgoCountry: string;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	translations: {
		partnerSince: string;
		badgeRecipient: string;
		badgeRecipientBy: string;
		badgeActive: string;
		badgeFormer: string;
		badgeSuspended: string;
		fundRaiser: string;
		mission: string;
		founded: string;
		headquarter: string;
		moreLinks: string;
		website: string;
		facebook: string;
		instagram: string;
		linkedin: string;
		youtube: string;
		permalink: string;
	};
};

export type { NgoCardProps, NgoEntryJSON, NgoHomeProps, NgoHoverCardType };

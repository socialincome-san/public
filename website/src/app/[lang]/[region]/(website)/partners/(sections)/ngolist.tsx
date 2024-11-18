import { DefaultParams } from '@/app/[lang]/[region]';
import NgoCard from '@/app/[lang]/[region]/(website)/partners/(sections)/ngocard';
import { WebsiteLanguage } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { CH, SL } from 'country-flag-icons/react/1x1';
import { ReactElement } from 'react';

const country_abbreviations_to_flag_map: Record<string, ReactElement> = {
	SL: <SL className="h-5 w-5 rounded-full" />,
	CH: <CH className="h-5 w-5 rounded-full" />,
};

function getFlag(abbreviation: string): ReactElement {
	return country_abbreviations_to_flag_map[abbreviation] || <SL className="h-5 w-5 rounded-full" />;
}
type QuoteType = {
	text: string;
	color: FontColor;
}[];

type SdgBadgeType = {
	hoverCardOrgName: string;
	sdgNumber: number;
	translatorSdg: string;
	translatorSdgTitle: string;
	translatorSdgMission1: string;
	translatorSdgMission2: string;
};

type CountryBadgeType = {
	countryFlagComponent?: ReactElement;
	countryAbbreviation: string;
};

type RecipientsBadgeType = {
	hoverCardOrgName: string;
	hoverCardTotalRecipients?: number;
	hoverCardTotalActiveRecipients?: number;
	hoverCardTotalFormerRecipients?: number;
	hoverCardTotalSuspendedRecipients?: number;
	isInsideHoverCard?: boolean;
	translatorBadgeRecipients: string;
	translatorBadgeRecipientsBy: string;
	translatorBadgeActive: string;
	translatorBadgeFormer: string;
	translatorBadgeSuspended: string;
};

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

export async function NgoList({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners'],
	});
	const image_base_path = '/assets/partners/';

	const ngoArray: NgoEntryJSON[] = translator.t('ngos');
	const ngoCardPropsArray: NgoCardProps[] = [];
	for (let i = 0; i < ngoArray.length; ++i) {
		const recipientsBadge: RecipientsBadgeType = {
			hoverCardOrgName: ngoArray[i]['org-long-name'],
			hoverCardTotalRecipients: ngoArray[i]['recipients-total'],
			hoverCardTotalActiveRecipients: ngoArray[i]['recipients-active'],
			hoverCardTotalFormerRecipients: ngoArray[i]['recipients-former'],
			hoverCardTotalSuspendedRecipients: ngoArray[i]['recipients-suspend'],
			translatorBadgeRecipients: '',
			translatorBadgeRecipientsBy: '',
			translatorBadgeActive: '',
			translatorBadgeFormer: '',
			translatorBadgeSuspended: '',
		};
		const sdgBadges: SdgBadgeType[] = [];
		ngoArray[i]['org-focus-sdg-numbers'].forEach((sdgNumber) => {
			sdgBadges.push({
				hoverCardOrgName: ngoArray[i]['org-short-name'],
				sdgNumber: sdgNumber,
				translatorSdg: '',
				translatorSdgTitle: '',
				translatorSdgMission1: '',
				translatorSdgMission2: '',
			});
		});

		const countryBadge: CountryBadgeType = {
			countryAbbreviation: ngoArray[i]['org-country'],
			countryFlagComponent: getFlag(ngoArray[i]['org-country']),
		};
		const ngoHoverCard: NgoHoverCardType = {
			orgImage: image_base_path.concat(ngoArray[i]['org-image']),
			orgLongName: ngoArray[i]['org-long-name'],
			partnershipStart: ngoArray[i]['partnership-start'],
			orgDescriptionParagraphs: ngoArray[i]['org-description-paragraphs'],
			quote: ngoArray[i]['org-quote'] ?? null,
			quoteAuthor: ngoArray[i]['org-quote-author'] ?? null,
			quotePhoto: ngoArray[i]['org-quote-photo'] ? image_base_path.concat(ngoArray[i]['org-quote-photo']) : null,
			orgFoundation: ngoArray[i]['org-foundation'],
			orgHeadquarter: ngoArray[i]['org-headquarter'],
			orgWebsite: ngoArray[i]['org-website'] ?? null,
			orgFacebook: ngoArray[i]['org-facebook'] ?? null,
			orgInstagram: ngoArray[i]['org-instagram'] ?? null,
			orgLinkedIn: ngoArray[i]['org-linkedin'] ?? null,
			orgYoutube: ngoArray[i]['org-youtube'] ?? null,
			orgFundRaiserText: ngoArray[i]['org-fundraiser-text'] ?? null,
		};

		const ngoCardProps: NgoCardProps = {
			orgShortName: ngoArray[i]['org-short-name'],
			orgMission: ngoArray[i]['org-mission'],
			countryBadge: countryBadge,
			recipientsBadge: recipientsBadge,
			sdgBadges: sdgBadges,
			ngoHoverCard: ngoHoverCard,
			lang: lang,
		};
		ngoCardPropsArray.push(ngoCardProps);
	}

	return (
		<div className="mx-auto max-w-6xl">
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				{ngoCardPropsArray.map((props, index) => (
					<NgoCard {...props} key={index} />
				))}
			</div>
		</div>
	);
}

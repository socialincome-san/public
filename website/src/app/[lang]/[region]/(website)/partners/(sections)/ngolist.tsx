import { DefaultParams } from '@/app/[lang]/[region]';
import NgoCard from '@/app/[lang]/[region]/(website)/partners/(sections)/ngocard';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { FontColor } from '@socialincome/ui/src/interfaces/color';
import { SL } from 'country-flag-icons/react/1x1';
import { ReactElement } from 'react';
import Ngo1 from '../(assets)/aurora.png';

type quoteType = {
	text: string;
	color: FontColor;
}[];

type sdgBadgeType = {
	hoverCardOrgName: string;
	sdgNumber: number;
};

type countryBadgeType = {
	countryFlagComponent?: ReactElement;
	countryAbbreviation: string;
};

type recipientsBadgeType = {
	hoverCardOrgName: string;
	hoverCardTotalRecipients: number;
	hoverCardTotalActiveRecipients?: number;
	hoverCardTotalFormerRecipients?: number;
	hoverCardTotalSuspendedRecipients?: number;
	isInsideHoverCard?: boolean;
};

type ngoHoverCardType = {
	//TODO: Remove any
	orgImage: any;
	// orgImage: StaticImageData;
	orgLongName: string;
	partnershipStart: string;
	orgDescription: string;
	quote: quoteType;
	quoteAuthor: string;
	orgFoundation: string;
	orgHeadquarter: string;
	orgWebsite?: string;
	orgFacebook?: string;
	orgInstagram?: string;
};

type NgoCardProps = {
	orgShortName: string;
	orgMission: string;
	countryBadge?: countryBadgeType;
	recipientsBadge?: recipientsBadgeType;
	sdgBadges?: sdgBadgeType[];
	ngoHoverCard: ngoHoverCardType;
	lang: string;
};

export async function NgoList({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners'],
	});

	const ngoArray = translator.t('ngos');
	const ngoCardPropsArray: NgoCardProps[] = [];
	for (let i = 0; i < ngoArray.length; ++i) {
		const recipientsBadge: recipientsBadgeType = {
			hoverCardOrgName: String(ngoArray[i]['org-long-name']),
			hoverCardTotalRecipients: Number(ngoArray[i]['recipients-total']),
			hoverCardTotalActiveRecipients: Number(ngoArray[i]['recipients-active']),
			hoverCardTotalFormerRecipients: Number(ngoArray[i]['recipients-former']),
			hoverCardTotalSuspendedRecipients: Number(ngoArray[i]['recipients-suspend']),
		};
		const sdgBadges: sdgBadgeType[] = [];
		ngoArray[i]['org-focus-sdg-numbers'].forEach((sdgNumber) => {
			sdgBadges.push({
				hoverCardOrgName: String(ngoArray[i]['org-short-name']),
				sdgNumber: sdgNumber,
			});
		});

		const countryBadge: countryBadgeType = {
			countryAbbreviation: String(ngoArray[i]['org-country']),
			//TODO: Component hardcoded for all ngos
			countryFlagComponent: <SL className="h-5 w-5 rounded-full" />,
		};

		const ngoHoverCard: ngoHoverCardType = {
			//TODO: Image hardcoded for all ngos
			orgImage: Ngo1,
			orgLongName: String(ngoArray[i]['org-long-name']),
			partnershipStart: String(ngoArray[i]['partnership-start']),
			orgDescription: String(ngoArray[i]['org-description']),
			quote: ngoArray[i]['org-quote'] as quoteType,
			quoteAuthor: String(ngoArray[i]['org-quote-author']),
			orgFoundation: String(ngoArray[i]['org-foundation']),
			orgHeadquarter: String(ngoArray[i]['org-headquarter']),
			orgWebsite: String(ngoArray[i]['org-website']) ?? null,
			orgFacebook: String(ngoArray[i]['org-facebook']) ?? null,
			orgInstagram: String(ngoArray[i]['org-instagram']) ?? null,
		};

		const ngoCardProps: NgoCardProps = {
			orgShortName: String(ngoArray[i]['org-short-name']),
			orgMission: String(ngoArray[i]['org-mission']),
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

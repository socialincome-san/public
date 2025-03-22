import { DefaultParams } from '@/app/[lang]/[region]';
import NgoCard from '@/app/[lang]/[region]/(website)/partners/(sections)/ngocard';
import {
	CountryBadgeType,
	RecipientsBadgeType,
	SdgBadgeType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import {
	NgoCardProps,
	NgoEntryJSON,
	NgoHoverCardType,
} from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { firestoreAdmin } from '@/firebase-admin';
import { RecipientProgramStatus } from '@socialincome/shared/src/types/recipient';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	OrganisationRecipientsByStatus,
	RecipientStatsCalculator,
} from '@socialincome/shared/src/utils/stats/RecipientStatsCalculator';
import { CH, SL } from 'country-flag-icons/react/1x1';
import { ReactElement } from 'react';

const country_abbreviations_to_flag_map: Record<string, ReactElement> = {
	SL: <SL className="h-5 w-5 rounded-full" />,
	CH: <CH className="h-5 w-5 rounded-full" />,
};

function getFlag(abbreviation: string): ReactElement {
	return country_abbreviations_to_flag_map[abbreviation] || <SL className="h-5 w-5 rounded-full" />;
}
export const ngos = ['aurora', 'jamil', 'reachout', 'equal-rights', 'united-polio', 'slaes'];

export async function NgoList({ lang, region }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners'],
	});
	const image_base_path = '/assets/partners/';

	const ngoArray: NgoEntryJSON[] = ngos.map((slug: string) => translator.t(slug));
	const ngoCardPropsArray: NgoCardProps[] = [];

	const recipientCalculator = await RecipientStatsCalculator.build(firestoreAdmin);
	const recipientStats: OrganisationRecipientsByStatus =
		recipientCalculator.allStats().recipientsCountByOrganisationAndStatus;

	for (let i = 0; i < ngoArray.length; ++i) {
		const currentOrgRecipientStats = recipientStats[ngos[i]];

		const recipientsBadge: RecipientsBadgeType = {
			hoverCardOrgName: ngoArray[i]['org-long-name'],
			hoverCardTotalRecipients: currentOrgRecipientStats ? currentOrgRecipientStats['total'] : 0,
			hoverCardTotalActiveRecipients: currentOrgRecipientStats
				? currentOrgRecipientStats[RecipientProgramStatus.Active]
				: 0,
			hoverCardTotalFormerRecipients: currentOrgRecipientStats
				? currentOrgRecipientStats[RecipientProgramStatus.Former]
				: 0,
			hoverCardTotalSuspendedRecipients: currentOrgRecipientStats
				? currentOrgRecipientStats[RecipientProgramStatus.Suspended]
				: 0,
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
			orgSlug: ngoArray[i]['org-slug'],
		};

		const ngoCardProps: NgoCardProps = {
			orgShortName: ngoArray[i]['org-short-name'],
			orgMission: ngoArray[i]['org-mission'],
			countryBadge: countryBadge,
			recipientsBadge: recipientsBadge,
			sdgBadges: sdgBadges,
			ngoHoverCard: ngoHoverCard,
			lang: lang,
			region: region,
		};
		ngoCardPropsArray.push(ngoCardProps);
	}

	return (
		<div className="mx-auto max-w-6xl">
			<div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-2">
				{ngoCardPropsArray.map((props, index) => (
					<NgoCard key={index} {...props} />
				))}
			</div>
		</div>
	);
}

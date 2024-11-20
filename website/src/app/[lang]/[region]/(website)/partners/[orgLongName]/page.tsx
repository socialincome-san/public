'use client';
import { DefaultPageProps } from '@/app/[lang]/[region]';
import { PartnerHome } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerHome';
import { CountryBadgeType, RecipientsBadgeType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerBadges';
import { NgoEntryJSON, NgoHoverCardType } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { CH, SL } from 'country-flag-icons/react/1x1';
import { useParams } from 'next/navigation';
import { ReactElement } from 'react';

const country_abbreviations_to_flag_map: Record<string, ReactElement> = {
	SL: <SL className="h-5 w-5 rounded-full" />,
	CH: <CH className="h-5 w-5 rounded-full" />,
};

function getFlag(abbreviation: string): ReactElement {
	return country_abbreviations_to_flag_map[abbreviation] || <SL className="h-5 w-5 rounded-full" />;
}
export default async function Page({ params: { lang } }: DefaultPageProps) {
	const { orgLongName } = useParams() as { orgLongName: string };

	const deSlugifiedOrgLongName = orgLongName.replace('-', ' ');
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners', 'website-common', 'countries'],
	});
	const ngoArray: NgoEntryJSON[] = translator.t('ngos');
	//TODO: Currently hardcoded ngo for ngo not found, need to remove this
	const currentNgo: NgoEntryJSON =
		ngoArray.find((ngo) => ngo['org-long-name'].toLowerCase() === deSlugifiedOrgLongName) || ngoArray[0];

	const image_base_path = '/assets/partners/';
	const recipientsBadge: RecipientsBadgeType = {
		hoverCardOrgName: currentNgo['org-long-name'],
		hoverCardTotalRecipients: currentNgo['recipients-total'],
		hoverCardTotalActiveRecipients: currentNgo['recipients-active'],
		hoverCardTotalFormerRecipients: currentNgo['recipients-former'],
		hoverCardTotalSuspendedRecipients: currentNgo['recipients-suspend'],
		translatorBadgeRecipients: '',
		translatorBadgeRecipientsBy: '',
		translatorBadgeActive: '',
		translatorBadgeFormer: '',
		translatorBadgeSuspended: '',
	};

	const countryBadge: CountryBadgeType = {
		countryAbbreviation: currentNgo['org-country'],
		countryFlagComponent: getFlag(currentNgo['org-country']),
	};
	const ngoHoverCard: NgoHoverCardType = {
		orgImage: image_base_path.concat(currentNgo['org-image']),
		orgLongName: currentNgo['org-long-name'],
		partnershipStart: currentNgo['partnership-start'],
		orgDescriptionParagraphs: currentNgo['org-description-paragraphs'],
		quote: currentNgo['org-quote'] ?? null,
		quoteAuthor: currentNgo['org-quote-author'] ?? null,
		quotePhoto: currentNgo['org-quote-photo'] ? image_base_path.concat(currentNgo['org-quote-photo']) : null,
		orgFoundation: currentNgo['org-foundation'],
		orgHeadquarter: currentNgo['org-headquarter'],
		orgWebsite: currentNgo['org-website'] ?? null,
		orgFacebook: currentNgo['org-facebook'] ?? null,
		orgInstagram: currentNgo['org-instagram'] ?? null,
		orgLinkedIn: currentNgo['org-linkedin'] ?? null,
		orgYoutube: currentNgo['org-youtube'] ?? null,
		orgFundRaiserText: currentNgo['org-fundraiser-text'] ?? null,
	};

	return (
		<PartnerHome
			ngoHoverCard={ngoHoverCard}
			countryBadge={countryBadge}
			recipientsBadge={recipientsBadge}
			orgMission={currentNgo['org-mission']}
			countryLongName={translator.t(countryBadge.countryAbbreviation || 'SL')}
			orgShortName={currentNgo['org-short-name']}
			partnerSinceTranslation={translator.t('ngo-generic.partner-since')}
			badgeRecipientTranslation={translator.t('badges.recipients')}
			badgeRecipientTranslationBy={translator.t('badges.recipients-by')}
			badgeActiveTranslation={translator.t('badges.active')}
			badgeFormerTranslation={translator.t('badges.former')}
			badgeSuspendedTranslation={translator.t('badges.suspended')}
			fundRaiserTranslation={translator.t('ngo-generic.fundraiser')}
			missionTranslation={translator.t('ngo-generic.mission')}
			foundedTranslation={translator.t('ngo-generic.founded')}
			headquarterTranslation={translator.t('ngo-generic.headquarter')}
			moreLinksTranslation={translator.t('links.more')}
			websiteTranslation={translator.t('links.website')}
			facebookTranslation={translator.t('links.facebook')}
			instagramTranslation={translator.t('links.instagram')}
			linkedinTranslation={translator.t('links.linkedin')}
			youtubeTranslation={translator.t('links.youtube')}
		/>
	);
}

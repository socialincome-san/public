import { DefaultPageProps, DefaultParams } from '@/app/[lang]/[region]';
import { PartnerHome } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerHome';
import { Translator } from '@socialincome/shared/src/utils/i18n';

type NGOTranslation = {
	name: string;
	// more fields
};

export function getNGOTranslation(translator: Translator, slug: string): NGOTranslation {
	return translator.t(slug);
}

type PartnerPageProps = {
	params: {
		slug: string;
	} & DefaultParams;
} & DefaultPageProps;

export default async function Page({ params: { lang, slug } }: PartnerPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners', 'website-common', 'countries'],
	});

	const translation = getNGOTranslation(translator, slug);


	return (
		<PartnerHome
			ngoArray={translator.t('ngos')}
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
			permalinkTranslation={translator.t('ngo-generic.permalink')}
		/>
	);
}

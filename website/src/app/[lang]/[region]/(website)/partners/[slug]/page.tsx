import { DefaultPageProps, DefaultParams } from '@/app/[lang]/[region]';
import { PartnerHome } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerHome';
import { NgoEntryJSON } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { redirect } from 'next/navigation';
import { ngos } from '../(sections)/ngolist';

function getNGOTranslation(translator: Translator, slug: string): NgoEntryJSON | undefined {
	let currentNgo: NgoEntryJSON | undefined = undefined;
	for (const ngo of ngos) {
		if ((translator.t(ngo) as NgoEntryJSON)['org-slug'] === slug) {
			currentNgo = translator.t(ngo);
			break;
		}
	}
	return currentNgo;
}

type PartnerPageProps = {
	params: {
		slug: string;
	} & DefaultParams;
} & DefaultPageProps;

export default async function Page({ params: { lang, region, slug } }: PartnerPageProps) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-partners', 'website-common', 'countries'],
	});

	const translations = {
		partnerSince: translator.t('ngo-generic.partner-since'),
		badgeRecipient: translator.t('badges.recipients'),
		badgeRecipientBy: translator.t('badges.recipients-by'),
		badgeActive: translator.t('badges.active'),
		badgeFormer: translator.t('badges.former'),
		badgeSuspended: translator.t('badges.suspended'),
		fundRaiser: translator.t('ngo-generic.fundraiser'),
		mission: translator.t('ngo-generic.mission'),
		founded: translator.t('ngo-generic.founded'),
		headquarter: translator.t('ngo-generic.headquarter'),
		moreLinks: translator.t('links.more'),
		website: translator.t('links.website'),
		facebook: translator.t('links.facebook'),
		instagram: translator.t('links.instagram'),
		linkedin: translator.t('links.linkedin'),
		youtube: translator.t('links.youtube'),
		permalink: translator.t('ngo-generic.permalink'),
	};

	const currentNgo: NgoEntryJSON | undefined = getNGOTranslation(translator, slug.replaceAll('%26', '&'));
	if (!currentNgo) {
		redirect('/not-found');
	}
	const currentNgoCountry = translator.t(currentNgo!['org-country'] || 'SL');

	return (
		<PartnerHome
			lang={lang}
			region={region}
			currentNgo={currentNgo}
			currentNgoCountry={currentNgoCountry}
			translations={translations}
		/>
	);
}

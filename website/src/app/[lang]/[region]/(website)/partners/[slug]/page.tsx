import { DefaultParams } from '@/app/[lang]/[region]';
import { PartnerHome } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerHome';
import { NgoEntryJSON } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { redirect } from 'next/navigation';
import { ngos } from '../(sections)/ngolist';

async function getNGOTranslations(
	translator: Translator,
	slug: string,
): Promise<{ translation: NgoEntryJSON | undefined }> {
	let currentNgo: NgoEntryJSON | undefined = undefined;
	for (const ngo of ngos) {
		if ((translator.t(ngo) as NgoEntryJSON)['org-slug'] === slug) {
			currentNgo = translator.t(ngo);
			break;
		}
	}
	return { translation: currentNgo };
}

interface PartnerPageParams extends DefaultParams {
	slug: string;
}

interface PartnerPageProps {
	params: Promise<PartnerPageParams>;
}

export default async function Page({ params }: PartnerPageProps) {
	const { lang, region, slug } = await params;

	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
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

	const { translation: currentNgo } = await getNGOTranslations(translator, slug.replaceAll('%26', '&'));
	if (!currentNgo) {
		redirect('/not-found');
	}
	const currentNgoCountry = translator.t(currentNgo!['org-country'] || 'SL');

	return (
		<PartnerHome
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			currentNgo={currentNgo}
			currentNgoCountry={currentNgoCountry}
			translations={translations}
		/>
	);
}

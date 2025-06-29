import { DefaultParams } from '@/app/[lang]/[region]';
import { PartnerHome } from '@/app/[lang]/[region]/(website)/partners/(components)/PartnerHome';
import { NgoEntryJSON, NgoHomeProps } from '@/app/[lang]/[region]/(website)/partners/(types)/PartnerCards';
import { firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import {
	OrganisationRecipientsByStatus,
	RecipientStatsCalculator,
} from '@socialincome/shared/src/utils/stats/RecipientStatsCalculator';
import { redirect } from 'next/navigation';
import { ngos } from '../(sections)/ngolist';

async function getNGOTranslationAndStats(
	translator: Translator,
	slug: string,
): Promise<{ translation: NgoEntryJSON | undefined; stats: NgoHomeProps['recipientCounts'] }> {
	let currentNgo: NgoEntryJSON | undefined = undefined;
	let stats: NgoHomeProps['recipientCounts'] = {
		totalRecipients: 0,
		activeRecipients: 0,
		formerRecipients: 0,
		suspendedRecipients: 0,
	};
	const recipientCalculator = await RecipientStatsCalculator.build(firestoreAdmin);
	const recipientStats: OrganisationRecipientsByStatus =
		recipientCalculator.allStats().recipientsCountByOrganisationAndStatus;
	for (const ngo of ngos) {
		if ((translator.t(ngo) as NgoEntryJSON)['org-slug'] === slug) {
			currentNgo = translator.t(ngo);
			const currentOrgRecipientStats = recipientStats[ngo];
			stats = {
				totalRecipients: currentOrgRecipientStats ? currentOrgRecipientStats['total'] : 0,
				activeRecipients: currentOrgRecipientStats ? currentOrgRecipientStats['active'] : 0,
				suspendedRecipients: currentOrgRecipientStats ? currentOrgRecipientStats['suspended'] : 0,
				formerRecipients: currentOrgRecipientStats ? currentOrgRecipientStats['former'] : 0,
			};
			break;
		}
	}
	return { translation: currentNgo, stats: stats };
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

	const { translation: currentNgo, stats: recipientCounts } = await getNGOTranslationAndStats(
		translator,
		slug.replaceAll('%26', '&'),
	);
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
			recipientCounts={recipientCounts}
		/>
	);
}

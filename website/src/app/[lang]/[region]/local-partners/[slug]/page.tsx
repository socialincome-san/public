import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getCommunityPanelData } from '@/modules/community/community.service';
import { getLocalPartnerDashboardStats } from '@/modules/local-partners/local-partner-public.service';
import { getLocalPartnerBySlug } from '@/modules/storyblok-content/storyblok-content.service';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function LocalPartnerPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const localPartnerResult = await getLocalPartnerBySlug(slug, lang);

	if (!localPartnerResult.success) {
		return notFound();
	}

	const [statsResult, communityResult] = await Promise.all([
		getLocalPartnerDashboardStats(localPartnerResult.data.content.portalSlug),
		getCommunityPanelData(localPartnerResult.data.content, lang, region),
	]);
	const { recipientsCount, completedSurveysCount } = statsResult.success
		? statsResult.data
		: { recipientsCount: 0, completedSurveysCount: 0 };

	return (
		<LocalPartnerDetail
			localPartner={localPartnerResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			recipientsCount={recipientsCount}
			completedSurveysCount={completedSurveysCount}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}

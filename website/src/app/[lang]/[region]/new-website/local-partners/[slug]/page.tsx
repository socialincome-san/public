import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function LocalPartnerPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const localPartnerResult = await services.storyblok.getLocalPartnerBySlug(slug, lang);

	if (!localPartnerResult.success) {
		return notFound();
	}

	const localPartnerSlug = localPartnerResult.data.content.portalSlug?.trim();
	const dashboardStatsResult = localPartnerSlug
		? await services.read.localPartner.getPublicLocalPartnerDashboardStatsBySlug(localPartnerSlug)
		: undefined;

	return (
		<LocalPartnerDetail
			localPartner={localPartnerResult.data}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
			recipientsCount={dashboardStatsResult?.success ? dashboardStatsResult.data.recipientsCount : undefined}
			completedSurveysCount={dashboardStatsResult?.success ? dashboardStatsResult.data.completedSurveysCount : undefined}
		/>
	);
}

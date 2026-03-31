import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CampaignDetail } from '@/components/storyblok/campaign/campaign-detail';
import { getCampaignId } from '@/components/storyblok/campaign/campaign.utils';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export default async function CampaignPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang } = await params;
	const campaignResult = await services.storyblok.getCampaignBySlug(slug, lang);

	if (!campaignResult.success) {
		return notFound();
	}

	const campaignId = getCampaignId(campaignResult.data.content);
	const statsResult = campaignId ? await services.read.campaign.getPublicCampaignStatsById(campaignId) : undefined;

	return (
		<CampaignDetail
			campaign={campaignResult.data}
			lang={lang as WebsiteLanguage}
			contributionsCount={statsResult?.success ? statsResult.data.contributionsCount : undefined}
			daysLeft={statsResult?.success ? statsResult.data.daysLeft : undefined}
		/>
	);
}

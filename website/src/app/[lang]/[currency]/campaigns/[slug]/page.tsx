import { type DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { CampaignDetail } from '@/components/campaign/campaign-detail';
import { loadCampaignDetailData } from '@/components/storyblok/campaign/load-campaign-detail-data';
import { toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getWebsiteAlternates } from '@/lib/utils/metadata';
import { getCampaignFallbackMetadata, getCampaignPageMetadata } from '@/modules/campaigns/campaign-public-website.service';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { slug, lang } = await params;
	const data = await loadCampaignDetailData(slug, lang);

	if (!data) {
		const fallback = await getCampaignFallbackMetadata(lang as WebsiteLanguage);

		return fallback.success ? fallback.data : {};
	}

	const metadata = await getCampaignPageMetadata(lang as WebsiteLanguage, {
		title: data.title,
		description: data.description,
		primaryImage: data.primaryImage,
	});

	return {
		...(metadata.success ? metadata.data : {}),
		...getWebsiteAlternates(lang as WebsiteLanguage, `campaigns/${slug}`),
	};
};

export default async function CampaignPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const data = await loadCampaignDetailData(slug, lang);

	if (!data) {
		return notFound();
	}

	const communityResult = await getCommunityPanelData(data.communityPage, lang, toWebsiteCurrency(currency));

	return (
		<CampaignDetail
			campaign={data.campaign}
			title={data.title}
			description={data.description}
			creatorName={data.creatorName}
			quote={data.quote}
			primaryImage={data.primaryImage}
			profilePicture={data.profilePicture}
			sectionDescription={data.sectionDescription}
			sectionImage={data.sectionImage}
			instagramHandle={data.instagramHandle}
			xHandle={data.xHandle}
			tiktokHandle={data.tiktokHandle}
			linkWebsite={data.linkWebsite}
			faq={data.faq}
			campaignSlug={slug}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}

import { type DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { CampaignDetail } from '@/components/campaign/campaign-detail';
import { loadCampaignDetailData } from '@/components/storyblok/campaign/load-campaign-detail-data';
import { toWebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import { getStoryblokMetadataImage } from '@/lib/storyblok/storyblok-utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { notFound } from 'next/navigation';

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { slug, lang } = await params;
	const data = await loadCampaignDetailData(slug, lang);

	return getPageMetadata(
		lang as WebsiteLanguage,
		`campaigns/${slug}`,
		data
			? {
					title: data.title,
					description: data.description,
					image: getStoryblokMetadataImage(data.primaryImage, data.title),
				}
			: {},
	);
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

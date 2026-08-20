import { type DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CampaignDetail } from '@/components/campaign/campaign-detail';
import { loadCampaignDetailData } from '@/components/storyblok/campaign/load-campaign-detail-data';
import { type WebsiteLanguage, type WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { slug, lang } = await params;
	const data = await loadCampaignDetailData(slug, lang);

	if (!data) {
		return services.read.campaignPublicWebsite.getFallbackMetadata(lang as WebsiteLanguage);
	}

	return services.read.campaignPublicWebsite.getPageMetadata(lang as WebsiteLanguage, {
		title: data.title,
		description: data.description,
		primaryImage: data.primaryImage,
	});
};

export default async function CampaignPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const data = await loadCampaignDetailData(slug, lang);

	if (!data) {
		return notFound();
	}

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
			campaignSlug={slug}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}

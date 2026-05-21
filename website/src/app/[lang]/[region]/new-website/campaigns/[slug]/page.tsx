import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[region]';
import { CampaignDetail } from '@/components/campaign/campaign-detail';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { notFound } from 'next/navigation';

export const revalidate = 900;

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { slug, lang } = await params;

	return services.read.campaignPublicWebsite.getMetadataForSlug(slug, lang as WebsiteLanguage);
};

const CampaignInactiveMessage = async ({ lang }: { lang: WebsiteLanguage }) => {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-campaign'],
	});

	return (
		<section className="w-site-width max-w-content mx-auto px-6 py-16">
			<p className="text-primary text-center text-2xl font-medium">{translator.t('campaign.not-found')}</p>
		</section>
	);
};

export default async function CampaignPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, region } = await params;
	const result = await services.read.campaign.getBySlug(slug);

	if (!result.success || !result.data) {
		return notFound();
	}

	if (!result.data.isActive) {
		return <CampaignInactiveMessage lang={lang as WebsiteLanguage} />;
	}

	return (
		<CampaignDetail
			campaign={result.data}
			campaignSlug={slug}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}

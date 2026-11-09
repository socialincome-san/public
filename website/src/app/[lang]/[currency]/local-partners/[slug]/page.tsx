import { DefaultLayoutPropsWithSlug } from '@/app/[lang]/[currency]';
import { getPageMetadata } from '@/app/[lang]/[currency]/page-metadata';
import { getPublishedSlugParams } from '@/app/[lang]/[currency]/published-slug-params';
import { pickCommunityPage } from '@/components/community/pick-community-page';
import { LocalPartnerDetail } from '@/components/storyblok/local-partner/local-partner-detail';
import { getLocalPartnerDescription, getLocalPartnerTitle } from '@/components/storyblok/local-partner/local-partner.utils';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { toWebsiteCurrency } from '@/lib/i18n/utils';
import { getStoryblokMetadataImage } from '@/lib/storyblok/storyblok-utils';
import { getCommunityPanelData } from '@/modules/community/community.cache';
import { getLocalPartnerDashboardStats } from '@/modules/local-partners/local-partner.cache';
import { getLocalPartnerBySlug } from '@/modules/storyblok-content/storyblok-content.cache';
import { notFound } from 'next/navigation';

export const generateStaticParams = () => getPublishedSlugParams('local-partners');

export const generateMetadata = async ({ params }: DefaultLayoutPropsWithSlug) => {
	const { lang, slug } = await params;

	const localPartnerResult = await getLocalPartnerBySlug(slug, lang);
	const localPartner = localPartnerResult.success ? localPartnerResult.data.content : undefined;

	return getPageMetadata(
		lang as WebsiteLanguage,
		`local-partners/${slug}`,
		localPartner
			? {
					title: getLocalPartnerTitle(localPartner),
					description: getLocalPartnerDescription(localPartner),
					image: getStoryblokMetadataImage(localPartner.heroImage),
				}
			: {},
	);
};

export default async function LocalPartnerPage({ params }: DefaultLayoutPropsWithSlug) {
	const { slug, lang, currency } = await params;
	const localPartnerResult = await getLocalPartnerBySlug(slug, lang);

	if (!localPartnerResult.success) {
		return notFound();
	}

	const [statsResult, communityResult] = await Promise.all([
		getLocalPartnerDashboardStats(localPartnerResult.data.content.portalSlug),
		getCommunityPanelData(pickCommunityPage(localPartnerResult.data.content), lang, toWebsiteCurrency(currency)),
	]);
	const { recipientsCount, completedSurveysCount } = statsResult.success
		? statsResult.data
		: { recipientsCount: 0, completedSurveysCount: 0 };

	return (
		<LocalPartnerDetail
			localPartner={localPartnerResult.data}
			lang={lang as WebsiteLanguage}
			currency={toWebsiteCurrency(currency)}
			recipientsCount={recipientsCount}
			completedSurveysCount={completedSurveysCount}
			community={communityResult.success ? communityResult.data : null}
		/>
	);
}

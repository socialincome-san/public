import { DefaultPageProps } from '@/app/[lang]/[region]';
import { getLocalPartnerId } from '@/components/storyblok/local-partner/local-partner.utils';
import { LocalPartnersOverview } from '@/components/storyblok/local-partner/local-partners-overview';
import { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

export const revalidate = 900;

export default async function LocalPartnersPage({ params }: DefaultPageProps) {
	const { lang, region } = await params;
	const localPartnersResult = await services.storyblok.getLocalPartners(lang);
	const localPartners = localPartnersResult.success ? localPartnersResult.data : [];
	const localPartnerIds = [
		...new Set(localPartners.map((localPartner) => getLocalPartnerId(localPartner.content)).filter(Boolean)),
	];
	const statsResult = await services.read.localPartner.getPublicLocalPartnerStatsByIds(localPartnerIds);
	const statsById = statsResult.success ? statsResult.data : {};

	return (
		<LocalPartnersOverview
			localPartners={localPartners}
			statsById={statsById}
			lang={lang as WebsiteLanguage}
			region={region as WebsiteRegion}
		/>
	);
}

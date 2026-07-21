import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { LocalPartnersOverview } from '@/components/storyblok/local-partner/local-partners-overview';
import type { LocalPartnersOverview as LocalPartnersOverviewContent } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<LocalPartnersOverviewContent>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const LocalPartnersOverviewPage = async ({ overview, lang, region }: Props) => {
	const localPartnersResult = await services.storyblok.getLocalPartners(lang);
	const localPartners = (localPartnersResult.success ? localPartnersResult.data : []) as LocalPartnerStory[];
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		region,
	});

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<LocalPartnersOverview localPartners={localPartners} lang={lang} region={region} title={title} text={text} />
		</div>
	);
};

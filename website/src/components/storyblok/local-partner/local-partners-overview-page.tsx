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

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<LocalPartnersOverview localPartners={localPartners} lang={lang} region={region} title={title} text={text} />
		</div>
	);
};

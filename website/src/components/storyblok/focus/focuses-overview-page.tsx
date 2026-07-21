import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { FocusesOverview } from '@/components/storyblok/focus/focuses-overview';
import type { FocusOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<FocusOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

export const FocusesOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const focusesResult = await services.storyblok.getFocuses(lang);
	const focuses = (focusesResult.success ? focusesResult.data : []) as FocusStory[];
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
			<FocusesOverview focuses={focuses} lang={lang} region={region} title={title} text={text} searchParams={searchParams} />
		</div>
	);
};

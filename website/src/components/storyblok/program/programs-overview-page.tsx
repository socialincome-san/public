import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';
import { ProgramsOverviewSection } from './programs-overview-section';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

export const ProgramsOverviewPage = async ({ overview, lang, region, searchParams }: Props) => {
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		region,
	});

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<CmsHeader title={title} text={text} />
			<ProgramsOverviewSection lang={lang} region={region} searchParams={searchParams} />
		</div>
	);
};

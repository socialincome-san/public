import { BlockWrapper } from '@/components/block-wrapper';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';
import { ProgramsOverviewSection } from './programs-overview-section';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	searchParams?: AnySearchParams;
};

export const ProgramsOverviewPage = async ({ overview, searchParams }: Props) => {
	const { lang, region } = await getWebsiteRootParams();
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
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<CmsHeader title={title} text={text} />
				<section className="mt-8 flex flex-col gap-6">
					<ProgramsOverviewSection searchParams={searchParams} />
				</section>
			</BlockWrapper>
		</div>
	);
};

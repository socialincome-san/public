import type { AnySearchParams } from '@/app/page-props';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { ISbStoryData } from '@storyblok/js';
import { Suspense } from 'react';
import { ProgramsOverviewSection } from './programs-overview-section';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

export const ProgramsOverviewPage = async ({ overview, lang, currency, searchParams }: Props) => {
	const title = overview.content.title?.trim() ?? overview.name;
	const text = overview.content.text?.trim();
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: title,
		lang,
		currency,
		includeCurrentLabel: false,
	});

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb links={breadcrumbLinks} layout="section" />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<PageIntro title={title} description={text} />
				<section className="mt-8 flex flex-col gap-6">
					<Suspense fallback={<AppLoadingSkeleton />}>
						<ProgramsOverviewSection lang={lang} currency={currency} searchParams={searchParams} />
					</Suspense>
				</section>
			</BlockWrapper>
		</div>
	);
};

import type { AnySearchParams } from '@/app/page-props';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { FocusStory } from '@/components/storyblok/focus/focus.types';
import { FocusesOverview } from '@/components/storyblok/focus/focuses-overview';
import type { FocusOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getFocusesAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { ISbStoryData } from '@storyblok/js';
import { Suspense } from 'react';

type Props = {
	overview: ISbStoryData<FocusOverview>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

export const FocusesOverviewPage = async ({ overview, lang, currency, searchParams }: Props) => {
	const focusesResult = await getFocusesAction(lang);
	const focuses = (focusesResult.success ? focusesResult.data : []) as FocusStory[];
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
				<div className="flex w-full flex-col gap-8">
					<PageIntro title={title} description={text} />
					<Suspense fallback={<AppLoadingSkeleton />}>
						<FocusesOverview focuses={focuses} lang={lang} currency={currency} searchParams={searchParams} />
					</Suspense>
				</div>
			</BlockWrapper>
		</div>
	);
};

import type { AnySearchParams } from '@/app/page-props';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import type { LocalPartnerStory } from '@/components/storyblok/local-partner/local-partner.types';
import { LocalPartnersOverview } from '@/components/storyblok/local-partner/local-partners-overview';
import { LocalPartnersTeaserIntro } from '@/components/storyblok/local-partner/local-partners-teaser-intro';
import type { LocalPartnersOverview as LocalPartnersOverviewContent } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { getLocalPartnersAction } from '@/modules/storyblok-content/storyblok-content.actions';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { PageIntro } from '@socialincome/design-system/layout/page-intro/page-intro';
import type { ISbStoryData } from '@storyblok/js';
import { Suspense } from 'react';

type Props = {
	overview: ISbStoryData<LocalPartnersOverviewContent>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

export const LocalPartnersOverviewPage = async ({ overview, lang, currency, searchParams }: Props) => {
	const localPartnersResult = await getLocalPartnersAction(lang);
	const localPartners = (localPartnersResult.success ? localPartnersResult.data : []) as LocalPartnerStory[];
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
					{title || text ? <PageIntro title={title} description={text} /> : <LocalPartnersTeaserIntro />}
					<Suspense fallback={<AppLoadingSkeleton />}>
						<LocalPartnersOverview
							localPartners={localPartners}
							lang={lang}
							currency={currency}
							searchParams={searchParams}
						/>
					</Suspense>
				</div>
			</BlockWrapper>
		</div>
	);
};

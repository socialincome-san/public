import type { AnySearchParams } from '@/app/page-props';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { PageBlocks } from '@/components/content-types/page';
import type { ProgramOverview } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import type { ISbStoryData } from '@storyblok/js';

type Props = {
	overview: ISbStoryData<ProgramOverview>;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	searchParams: Promise<AnySearchParams>;
};

export const ProgramsOverviewPage = async ({ overview, lang, currency, searchParams }: Props) => {
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: overview.full_slug,
		currentLabel: overview.name,
		lang,
		currency,
		includeCurrentLabel: false,
	});

	return (
		<div className="flex flex-col gap-8 py-8">
			<Breadcrumb links={breadcrumbLinks} layout="section" />
			{/* A story saved before the blocks field existed has none */}
			<PageBlocks blocks={overview.content.content ?? []} lang={lang} currency={currency} searchParams={searchParams} />
		</div>
	);
};

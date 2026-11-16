import type { AnySearchParams } from '@/app/page-props';
import { blockMargins } from '@/components/content-blocks/block-margins';
import { getProgramGridPrograms, ProgramGridView } from '@/components/content-blocks/program-grid-view';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { ProgramsOverviewSection } from '@/components/storyblok/program/programs-overview-section';
import type { ProgramGrid } from '@/generated/storyblok/types/109655/storyblok-components';
import { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { AppLoadingSkeleton } from '@socialincome/design-system/feedback/app-loading-skeleton/app-loading-skeleton';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { SectionHeading } from '@socialincome/design-system/layout/section-heading/section-heading';
import { storyblokEditable } from '@storyblok/react';
import { Suspense } from 'react';

type Props = {
	blok: ProgramGrid;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
	// The filter bar keeps its filters and search in the URL
	searchParams?: Promise<AnySearchParams>;
};

export const ProgramGridBlock = async ({ blok, lang, currency, searchParams }: Props) => {
	const intro = (
		<>
			{blok.heading && (
				<div className="mb-8 md:mb-10">
					<SectionHeading size={3}>
						<StoryblokMarkdown>{blok.heading}</StoryblokMarkdown>
					</SectionHeading>
				</div>
			)}
			{blok.description && (
				<p className="text-foreground -mt-4 mb-10 text-center text-lg leading-7 font-normal whitespace-pre-line">
					<StoryblokMarkdown>{blok.description}</StoryblokMarkdown>
				</p>
			)}
		</>
	);

	if (blok.showFilters) {
		return (
			<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
				{intro}
				<Suspense fallback={<AppLoadingSkeleton />}>
					<ProgramsOverviewSection
						lang={lang}
						currency={currency}
						searchParams={searchParams ?? Promise.resolve({})}
						showFilters
					/>
				</Suspense>
			</BlockWrapper>
		);
	}

	const { programs, statsByPortalSlug, allProgramsCount } = await getProgramGridPrograms(blok, lang);
	if ((blok.hideConcludedPrograms || blok.filterBy) && programs.length === 0) {
		return null;
	}

	return (
		<BlockWrapper {...blockMargins(blok)} {...storyblokEditable(blok)}>
			{intro}
			<ProgramGridView
				programs={programs}
				statsByPortalSlug={statsByPortalSlug}
				allProgramsCount={allProgramsCount}
				blok={blok}
				lang={lang}
				currency={currency}
			/>
		</BlockWrapper>
	);
};

import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import { ProgramsOverviewSection } from '@/components/storyblok/program/programs-overview-section';
import type { Study } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { AnySearchParams } from '@/lib/types/page-props';
import type { ISbStoryData } from '@storyblok/js';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusText, getFocusTitle } from './focus.utils';
import { ImpactMeasurementPreviewWrapper } from './impact-measurement-preview-wrapper';
import { StudyCard } from './study-card';

type Props = {
	focus: FocusStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	searchParams?: AnySearchParams;
};

type StudyStory = ISbStoryData<Study>;

const isStudyStory = (study: StudyStory | string): study is StudyStory => {
	if (typeof study !== 'object' || study === null || !('content' in study)) {
		return false;
	}

	return study.content.component?.toLowerCase() === 'study';
};

const getImpactMeasurementFocusId = async (focus: FocusStory) => {
	const focusSlugs = new Set(
		[focus.content.portalSlug, getFocusSlug(focus), focus.slug]
			.map((slug) => slug?.trim())
			.filter((slug): slug is string => Boolean(slug)),
	);

	if (focusSlugs.size === 0) {
		return '';
	}

	const filterOptionsResult = await services.surveyImpact.getImpactFilterOptions();
	if (!filterOptionsResult.success) {
		return '';
	}

	return filterOptionsResult.data.focuses.find((option) => focusSlugs.has(option.label.trim()))?.value ?? '';
};

export const FocusDetail = async ({ focus, lang, region, searchParams }: Props) => {
	const title = getFocusTitle(focus.content);
	const text = getFocusText(focus.content);
	const focusPortalSlug = focus.content.portalSlug?.trim() ?? '';
	const { impactMeasurementTeaserButtonLabel, impactMeasurementTeaserText, impactMeasurementTitle, studiesTitle, studies } =
		focus.content;
	const studyStories = studies?.filter(isStudyStory) ?? [];
	const hasStudiesSection = Boolean(studiesTitle) || studyStories.length > 0;
	const hasImpactMeasurementSection = Boolean(impactMeasurementTitle);
	const hasSecondarySections = hasStudiesSection || hasImpactMeasurementSection;
	const [breadcrumbLinks, impactMeasurementFocusId] = await Promise.all([
		buildBreadcrumbLinks({
			fullSlug: focus.full_slug,
			currentLabel: title,
			lang,
			region,
		}),
		hasImpactMeasurementSection ? getImpactMeasurementFocusId(focus) : '',
	]);

	return (
		<div className="w-site-width max-w-content mx-auto px-6 py-8 pb-16">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<div className="pt-8">
				<div className="space-y-5">
					{title && <h1 className="text-foreground text-5xl leading-tight font-bold md:text-6xl">{title}</h1>}
					{text && <p className="text-foreground text-base leading-6 sm:text-lg sm:leading-7">{text}</p>}
				</div>

				<section className="mt-8 flex flex-col gap-6">
					<ProgramsOverviewSection
						lang={lang}
						region={region}
						searchParams={searchParams}
						fixedFocusSlug={focusPortalSlug}
					/>
				</section>

				{hasSecondarySections && (
					<div className="mt-12 flex flex-col gap-12 md:mt-24 md:gap-24 lg:mt-32 lg:gap-32">
						{hasStudiesSection && (
							<section className="flex flex-col gap-10">
								{studiesTitle && (
									<h2 className="text-foreground text-3xl leading-tight font-normal">
										<StoryblokMarkdown>{studiesTitle}</StoryblokMarkdown>
									</h2>
								)}
								{studyStories.length > 0 && (
									<div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
										{studyStories.map((study) => (
											<StudyCard key={study.uuid} study={study} lang={lang} region={region} />
										))}
									</div>
								)}
							</section>
						)}
						{hasImpactMeasurementSection && (
							<section className="flex flex-col gap-10">
								{impactMeasurementTitle && (
									<h2 className="text-foreground text-3xl leading-tight font-normal">
										<StoryblokMarkdown>{impactMeasurementTitle}</StoryblokMarkdown>
									</h2>
								)}
								{impactMeasurementFocusId && (
									<ImpactMeasurementPreviewWrapper
										focusId={impactMeasurementFocusId}
										lang={lang}
										region={region}
										teaserText={impactMeasurementTeaserText}
										teaserButtonLabel={impactMeasurementTeaserButtonLabel}
									/>
								)}
							</section>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

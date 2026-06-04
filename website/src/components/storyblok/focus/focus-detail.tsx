import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { buildBreadcrumbLinks } from '@/components/breadcrumb/build-breadcrumb-links';
import { StoryblokMarkdown } from '@/components/storyblok-markdown';
import type { Study } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { ISbStoryData } from '@storyblok/js';
import type { FocusStory } from './focus.types';
import { getFocusText, getFocusTitle } from './focus.utils';
import { StudyCard } from './study-card';

type Props = {
	focus: FocusStory;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

type StudyStory = ISbStoryData<Study>;

const isStudyStory = (study: StudyStory | string): study is StudyStory => {
	return typeof study === 'object' && study !== null && study.content.component === 'study';
};

export const FocusDetail = async ({ focus, lang, region }: Props) => {
	const title = getFocusTitle(focus.content);
	const text = getFocusText(focus.content);
	const { studiesTitle, studies } = focus.content;
	const studyStories = studies?.filter(isStudyStory) ?? [];
	const hasStudiesSection = Boolean(studiesTitle) || studyStories.length > 0;
	const breadcrumbLinks = await buildBreadcrumbLinks({
		fullSlug: focus.full_slug,
		currentLabel: title,
		lang,
		region,
	});

	return (
		<div className="w-site-width max-w-content mx-auto flex flex-col gap-8 px-6 py-8">
			<Breadcrumb links={breadcrumbLinks} className="py-0" />
			<div className="space-y-5">
				{title && <h1 className="text-4xl leading-tight font-bold text-cyan-900 sm:text-5xl">{title}</h1>}
				{text && <p className="text-base leading-6 text-cyan-950 sm:text-lg sm:leading-7">{text}</p>}
			</div>

			{hasStudiesSection && (
				<section className="flex flex-col gap-10">
					{studiesTitle && (
						<h2 className="text-5xl leading-tight font-normal text-cyan-900">
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
		</div>
	);
};

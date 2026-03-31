import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { FocusStory } from './focus.types';
import { getFocusId, getFocusSlug, getFocusTitle } from './focus.utils';

type Props = {
	focuses: FocusStory[];
	statsById: Record<
		string,
		{ programsCount: number; recipientsInProgramsCount: number; candidatesCount: number } | undefined
	>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const FocusesOverview = async ({ focuses, statsById, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{focuses.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('focuses-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{focuses.map((focus) => {
						const focusId = getFocusId(focus.content);
						const focusTitle = getFocusTitle(focus.content);
						const focusSlug = getFocusSlug(focus);
						const stats = focusId ? statsById[focusId] : undefined;
						const heroImageFilename = focus.content.heroImage?.filename;
						const heroImageAlt = focus.content.heroImage?.alt ?? focusTitle;

						return (
							<LandingPageCard
								key={focus.uuid}
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/focuses/${focusSlug}`}
								title={focusTitle}
								heroImageFilename={heroImageFilename}
								heroImageAlt={heroImageAlt}
								stats={
									stats
										? [
												{
													value: stats.programsCount,
													label:
														stats.programsCount === 1
															? translator.t('focuses-page.program-singular')
															: translator.t('focuses-page.program-plural'),
												},
												{
													value: stats.recipientsInProgramsCount,
													label:
														stats.recipientsInProgramsCount === 1
															? translator.t('focuses-page.recipient-in-program-singular')
															: translator.t('focuses-page.recipient-in-program-plural'),
												},
												{
													value: stats.candidatesCount,
													label:
														stats.candidatesCount === 1
															? translator.t('focuses-page.candidate-singular')
															: translator.t('focuses-page.candidate-plural'),
												},
											]
										: []
								}
							/>
						);
					})}
				</ul>
			)}
		</div>
	);
};

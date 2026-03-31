import { LandingPageCard } from '@/components/storyblok/shared/landing-page-card';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { NEW_WEBSITE_SLUG } from '@/lib/utils/const';
import type { ProgramStory } from './program.types';
import { getProgramId, getProgramSlug, getProgramTitle } from './program.utils';

type Props = {
	programs: ProgramStory[];
	statsById: Record<string, { campaignsCount: number; recipientsCount: number } | undefined>;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ProgramsOverview = async ({ programs, statsById, lang, region }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });

	return (
		<div className="flex w-full flex-col gap-6">
			{programs.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('programs-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{programs.map((program) => {
						const programId = getProgramId(program.content);
						const programTitle = getProgramTitle(program.content);
						const programSlug = getProgramSlug(program);
						const stats = programId ? statsById[programId] : undefined;
						const heroImageFilename = program.content.heroImage.filename;
						const heroImageAlt = program.content.heroImage.alt ?? programTitle;

						return (
							<LandingPageCard
								key={program.uuid}
								href={`/${lang}/${region}/${NEW_WEBSITE_SLUG}/programs/${programSlug}`}
								title={programTitle}
								heroImageFilename={heroImageFilename}
								heroImageAlt={heroImageAlt}
								stats={
									stats
										? [
												{
													value: stats.campaignsCount,
													label:
														stats.campaignsCount === 1
															? translator.t('programs-page.campaign-singular')
															: translator.t('programs-page.campaign-plural'),
												},
												{
													value: stats.recipientsCount,
													label:
														stats.recipientsCount === 1
															? translator.t('programs-page.recipient-singular')
															: translator.t('programs-page.recipient-plural'),
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

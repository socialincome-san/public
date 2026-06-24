import { CmsHeader } from '@/components/storyblok/shared/cms-header';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { FocusDetailCard } from './focus-detail-card';
import type { FocusStory } from './focus.types';
import { getFocusSlug, getFocusTitle } from './focus.utils';

type Props = {
	focuses: FocusStory[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	title?: string;
	text?: string;
};

export const FocusesOverview = async ({ focuses, lang, region, title, text }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-common'] });
	const focusSlugs = focuses.map((focus) => getFocusSlug(focus));
	const statsResult = await services.read.focus.getPublicFocusStatsBySlugs(focusSlugs);
	const statsBySlug = statsResult.success ? statsResult.data : {};

	return (
		<div className="flex w-full flex-col gap-8">
			<CmsHeader title={title} text={text} />
			{focuses.length === 0 ? (
				<p className="text-muted-foreground">{translator.t('focuses-page.empty')}</p>
			) : (
				<ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
					{focuses.map((focus) => {
						const focusSlug = getFocusSlug(focus);
						const focusTitle = getFocusTitle(focus.content);
						const stats = statsBySlug[focusSlug] ?? {
							programsCount: 0,
							recipientsInProgramsCount: 0,
							candidatesCount: 0,
						};

						return (
							<li key={focus.uuid} className="h-full">
								<FocusDetailCard
									href={`/${lang}/${region}/focuses/${focusSlug}`}
									focusTitle={focusTitle}
									recipientsCount={stats.recipientsInProgramsCount}
									programsCount={stats.programsCount}
									sdgsValue="-"
									labels={{
										recipients: translator.t('focuses-page.recipients'),
										programs: translator.t('focuses-page.programs'),
										sdgs: translator.t('focuses-page.sdgs'),
										candidatesReady: translator.t('focuses-page.candidates-ready-to-enroll', {
											context: { count: stats.candidatesCount },
										}),
									}}
								/>
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
};

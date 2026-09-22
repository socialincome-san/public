import { BlockWrapper } from '@/components/block-wrapper';
import { StatsOverview } from '@/components/open-source/stats-overview';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceStats } from '@/generated/storyblok/types/109655/storyblok-components';
import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getOpenSourceStatsAction } from '@/modules/github/github.actions';
import { EMPTY_GITHUB_REPO_STATS } from '@/modules/github/github.types';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';

type Props = {
	blok: OpenSourceStats;
	lang: WebsiteLanguage;
};

type OverviewLabels = {
	forks: { title: string; time: string };
	commits: { title: string; time: string };
	stars: { title: string };
};

export const OpenSourceStatsBlock = async ({ blok, lang }: Props) => {
	const [statsResult, translator] = await Promise.all([
		getOpenSourceStatsAction(),
		Translator.getInstance({ language: lang, namespaces: ['website-open-source'] }),
	]);

	const stats = statsResult.success ? statsResult.data : EMPTY_GITHUB_REPO_STATS;
	const overviewLabels = translator.t<OverviewLabels>('overview');
	const errorMessage = translator.t<string>('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok as SbBlokData)}>
			{!statsResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

			<StatsOverview
				stats={stats}
				commitsLabel={overviewLabels.commits.title}
				starsLabel={overviewLabels.stars.title}
				forksLabel={overviewLabels.forks.title}
				periodLabel={overviewLabels.commits.time}
				lang={lang}
			/>
		</BlockWrapper>
	);
};

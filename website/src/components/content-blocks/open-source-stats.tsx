import { StatsOverview } from '@/components/open-source/stats-overview';
import { OpenSourceUnavailableMessage } from '@/components/open-source/unavailable-message';
import type { OpenSourceStats } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { getOpenSourceStatsAction } from '@/modules/github/github.actions';
import { EMPTY_GITHUB_REPO_STATS } from '@/modules/github/github.types';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { storyblokEditable } from '@storyblok/react';
import { getTranslations } from 'next-intl/server';

type Props = {
	blok: OpenSourceStats;
	lang: WebsiteLanguage;
};

export const OpenSourceStatsBlock = async ({ blok, lang }: Props) => {
	const [statsResult, t] = await Promise.all([getOpenSourceStatsAction(), getTranslations('website-open-source')]);

	const stats = statsResult.success ? statsResult.data : EMPTY_GITHUB_REPO_STATS;
	const errorMessage = t('error.unavailable');

	return (
		<BlockWrapper {...storyblokEditable(blok)}>
			{!statsResult.success ? <OpenSourceUnavailableMessage message={errorMessage} /> : null}

			<StatsOverview
				stats={stats}
				commitsLabel={t('overview.commits.title')}
				starsLabel={t('overview.stars.title')}
				forksLabel={t('overview.forks.title')}
				periodLabel={t('overview.commits.time')}
				lang={lang}
			/>
		</BlockWrapper>
	);
};

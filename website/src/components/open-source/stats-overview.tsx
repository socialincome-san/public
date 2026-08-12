import { StatCard } from '@/components/open-source/stat-card';
import { getWebsiteRootParams } from '@/lib/i18n/website-root-params';
import type { GithubRepoStats } from '@/lib/services/github-api/github-api.types';

type Props = {
	stats: GithubRepoStats;
	commitsLabel: string;
	starsLabel: string;
	forksLabel: string;
	periodLabel: string;
};

export const StatsOverview = async ({ stats, commitsLabel, starsLabel, forksLabel, periodLabel }: Props) => {
	const { lang } = await getWebsiteRootParams();
	const cards = [
		{ label: commitsLabel, total: stats.totalCommits, delta: stats.newCommits },
		{ label: starsLabel, total: stats.totalStars, delta: stats.newStars },
		{ label: forksLabel, total: stats.totalForks, delta: stats.newForks },
	];

	return (
		<section>
			<div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
				{cards.map((card) => (
					<StatCard key={card.label} {...card} periodLabel={periodLabel} lang={lang} />
				))}
			</div>
		</section>
	);
};

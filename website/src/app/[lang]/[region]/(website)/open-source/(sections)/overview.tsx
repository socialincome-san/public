import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';
import { getCommits } from '../(components)/get-commits';
import { getForkCount } from '../(components)/get-forks';
import { getStarCount } from '../(components)/get-stars';

type OverviewProp = {
	title: string;
	total: number;
	time: string;
};

interface OverviewItem {
	title: string;
	time: string;
}

interface Overview {
	forks: OverviewItem;
	commits: OverviewItem;
	stars: OverviewItem;
}

function OverviewCard({ title, total, time }: OverviewProp) {
	return (
		<article className="border-foreground flex w-72 flex-col items-center rounded-xl border py-4">
			<Typography as="span" size="xs">
				{title}
			</Typography>
			<Typography as="span" size="3xl" weight="bold">
				{total}
			</Typography>
			<Typography as="span" size="xs" className="text-card-foreground-muted mt-1">
				{time}
			</Typography>
		</article>
	);
}

export async function Overview({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-open-source'],
	});

	const { totalForks, newForks } = await getForkCount();
	const { totalStars, newStars } = await getStarCount();
	const { newCommits, totalCommits } = await getCommits();
	const { forks, commits, stars }: Overview = translator.t('overview');

	return (
		<section className="flex w-full flex-col flex-wrap gap-6 md:flex-row">
			<OverviewCard
				title={forks.title}
				total={totalForks}
				time={newForks > 0 ? `+${newForks} last month` : `${newForks} last month`}
			/>
			<OverviewCard
				title={commits.title}
				total={totalCommits}
				time={newCommits > 0 ? `+${newCommits} last month` : `${newCommits} last month`}
			/>
			<OverviewCard
				title={stars.title}
				total={totalStars}
				time={newStars > 0 ? `+${newStars} last month` : `${newStars} last month`}
			/>
		</section>
	);
}

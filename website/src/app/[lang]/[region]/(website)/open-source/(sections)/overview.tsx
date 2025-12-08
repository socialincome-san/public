import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Card, Typography } from '@socialincome/ui';
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
		<Card className="bg-background hover:bg-primary rounded-lg border-2 border-opacity-80 px-2 py-5 shadow-none hover:bg-opacity-10 md:px-5 md:py-5">
			{/* Large screens layout */}
			<div className="hidden h-full items-center justify-between gap-4 md:flex">
				{/* Number on the left */}
				<div className="flex-shrink-0">
					<Typography as="span" size="5xl" weight="medium">
						{total}
					</Typography>
				</div>

				{/* Title and time on the right */}
				<div className="flex flex-col items-end">
					<Typography as="span" size="md">
						{title}
					</Typography>
					<Typography as="span" size="md" className="text-card-foreground-muted">
						{time}
					</Typography>
				</div>
			</div>

			{/* Medium and smaller screens layout */}
			<div className="flex flex-col items-center md:hidden">
				<Typography as="span" size="md" className="mb-2 text-center">
					{title}
				</Typography>
				<Typography as="span" size="5xl" weight="medium" className="my-2 text-center">
					{total}
				</Typography>
				<Typography as="span" size="md" className="text-card-foreground-muted text-center">
					{time}
				</Typography>
			</div>
		</Card>
	);
}

export async function Overview({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-open-source'],
	});

	const { totalForks, newForks } = await getForkCount();
	const { totalStars, newStars } = await getStarCount();
	const { newCommits, totalCommits } = await getCommits();
	const { forks, commits, stars }: Overview = translator.t('overview');

	return (
		<section>
			<div className="grid grid-cols-3 gap-3 md:gap-6">
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
				<OverviewCard
					title={forks.title}
					total={totalForks}
					time={newForks > 0 ? `+${newForks} last month` : `${newForks} last month`}
				/>
			</div>
		</section>
	);
}

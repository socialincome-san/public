import { DefaultParams } from '@/app/[lang]/[region]';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { ToggleGroup, ToggleGroupItem } from '@socialincome/ui';
import { getCommits } from '../(components)/get-commits';
import { getContributors } from '../(components)/get-contributors';
import { OpenSourceContributorsClient } from '../(components)/contributors-client';

type Metadata = {
	heading: string;
};

interface GitHubCommit {
	author: {
		id: number;
		login: string;
		avatar_url: string;
	};
	commit: {
		author: {
			date: string;
		};
	};
}

interface CombinedContributor {
	id: number;
	name: string;
	avatarUrl: string;
	commits: number;
	latestCommitDate: Date;
}

export async function OpenSourceContributors({ lang }: DefaultParams) {
	const translator = await Translator.getInstance({
		language: lang,
		namespaces: ['website-open-source'],
	});

	const metadata: Metadata = translator.t('metadata');
	const heading = metadata.heading;

	const contributors = await getContributors();
	const { totalCommitsData } = await getCommits();
	const totalContributors = contributors.length;

	// Collect the latest commit date for each contributor
	const latestCommitDates = new Map<number, Date>();
	totalCommitsData.forEach((commit: GitHubCommit) => {
		if (commit.author && commit.author.id && commit.commit.author.date) {
			const contributorId = commit.author.id;
			const commitDate = new Date(commit.commit.author.date);
			if (!latestCommitDates.has(contributorId) || commitDate > latestCommitDates.get(contributorId)) {
				latestCommitDates.set(contributorId, commitDate);
			}
		}
	});

	// Combine contributors' data with their latest commit dates
	const combinedContributors: CombinedContributor[] = [];
	contributors.forEach((contributor) => {
		if (latestCommitDates.has(contributor.id)) {
			combinedContributors.push({
				id: contributor.id,
				name: contributor.name,
				avatarUrl: contributor.avatarUrl,
				commits: contributor.commits,
				latestCommitDate: latestCommitDates.get(contributor.id),
			});
		}
	});

	const ContributorsByCommitCount = [...combinedContributors].sort(
		(a: CombinedContributor, b: CombinedContributor) => b.commits - a.commits
	);

	const ContributorsByLatestCommit = [...combinedContributors].sort(
		(a: CombinedContributor, b: CombinedContributor) => b.latestCommitDate.getTime() - a.latestCommitDate.getTime()
	);

	return (
		<OpenSourceContributorsClient
			ContributorsByCommitCount={ContributorsByCommitCount}
			ContributorsByLatestCommit={ContributorsByLatestCommit}
			heading={heading}
			totalContributors={totalContributors}
		/>
	);
}

export default OpenSourceContributors;

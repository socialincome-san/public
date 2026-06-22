export type GithubRepoStats = {
	totalCommits: number;
	newCommits: number;
	totalStars: number;
	newStars: number;
	totalForks: number;
	newForks: number;
};

export type GithubContributor = {
	id: number;
	name: string;
	commits: number;
	avatarUrl: string;
};

export type GithubIssue = {
	id: number;
	url: string;
	title: string;
	labels: string[];
};

export type GithubOpenSourcePageData = {
	stats: GithubRepoStats;
	contributors: GithubContributor[];
	issues: GithubIssue[];
	labels: string[];
};

export const EMPTY_GITHUB_OPEN_SOURCE_PAGE_DATA: GithubOpenSourcePageData = {
	stats: {
		totalCommits: 0,
		newCommits: 0,
		totalStars: 0,
		newStars: 0,
		totalForks: 0,
		newForks: 0,
	},
	contributors: [],
	issues: [],
	labels: [],
};

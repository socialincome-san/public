export type GithubRepoStats = {
	totalCommits: number;
	newCommits: number;
	totalStars: number;
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

export type GithubOpenSourceIssuesData = {
	issues: GithubIssue[];
	labels: string[];
};

export const EMPTY_GITHUB_REPO_STATS: GithubRepoStats = {
	totalCommits: 0,
	newCommits: 0,
	totalStars: 0,
	totalForks: 0,
	newForks: 0,
};

export const EMPTY_GITHUB_OPEN_SOURCE_ISSUES_DATA: GithubOpenSourceIssuesData = {
	issues: [],
	labels: [],
};

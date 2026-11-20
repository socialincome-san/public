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

export type GithubCodeContribution = {
	title: string;
	url: string;
	role: 'author' | 'reviewer';
};

export type GithubCodeContributions = {
	// All merged pull requests the person wrote or reviewed; `items` holds the latest of them
	total: number;
	items: GithubCodeContribution[];
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

export const GITHUB_CACHE_TAG = 'github';

import { fetchGithubData, fetchGithubGraphql, GITHUB_REPOSITORY } from '@/integrations/github/github.integration';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { now } from '@/lib/utils/now';
import type {
	GithubCodeContribution,
	GithubCodeContributions,
	GithubContributor,
	GithubIssue,
	GithubOpenSourceIssuesData,
	GithubRepoStats,
} from './github.types';

const HIDDEN_CONTRIBUTOR_LOGINS = new Set(['renovate[bot]', 'dependabot[bot]', 'Copilot']);

// Apps that open pull requests on their own, e.g. dependency updates
const AUTOMATION_APPS = ['renovate', 'dependabot', 'copilot-swe-agent', 'github-actions'];
const GITHUB_USERNAME_PATTERN = /^[a-z\d](?:[a-z\d-]{0,38})$/i;
const CODE_CONTRIBUTIONS_LIMIT = 100;

const CODE_CONTRIBUTIONS_QUERY = `
	query ($authored: String!, $reviewed: String!, $first: Int!) {
		authored: search(type: ISSUE, query: $authored, first: $first) {
			...pullRequests
		}
		reviewed: search(type: ISSUE, query: $reviewed, first: $first) {
			...pullRequests
		}
	}
	fragment pullRequests on SearchResultItemConnection {
		issueCount
		nodes {
			... on PullRequest {
				title
				url
				mergedAt
				author {
					__typename
				}
			}
		}
	}
`;

type PullRequestNode = {
	title: string;
	url: string;
	mergedAt: string;
	// null when the account was deleted
	author: { __typename: string } | null;
};

type PullRequestSearch = {
	issueCount: number;
	nodes: PullRequestNode[];
};

const isPullRequestNode = (value: unknown): value is PullRequestNode =>
	isRecord(value) &&
	typeof value.title === 'string' &&
	typeof value.url === 'string' &&
	typeof value.mergedAt === 'string' &&
	(value.author === null || (isRecord(value.author) && typeof value.author.__typename === 'string'));

const isPullRequestSearch = (value: unknown): value is PullRequestSearch =>
	isRecord(value) &&
	typeof value.issueCount === 'number' &&
	Array.isArray(value.nodes) &&
	value.nodes.every(isPullRequestNode);

/**
 * The merged pull requests of this repository that the person wrote or reviewed, newest first. One they wrote
 * counts once, as written. The search cannot sort by merge date, so the list holds the most recently opened ones.
 */
export const getCodeContributions = async (username: string): Promise<Result<GithubCodeContributions>> => {
	const login = username.trim().toLowerCase();
	// The name goes into a search query, so anything that is no GitHub username stops here
	if (!GITHUB_USERNAME_PATTERN.test(login)) {
		return resultFail('GitHub username is invalid');
	}
	const mergedPullRequests = `repo:${GITHUB_REPOSITORY} is:pr is:merged`;
	const result = await fetchGithubGraphql(CODE_CONTRIBUTIONS_QUERY, {
		authored: `${mergedPullRequests} author:${login} sort:created-desc`,
		reviewed: [
			mergedPullRequests,
			`reviewed-by:${login}`,
			`-author:${login}`,
			...AUTOMATION_APPS.map((app) => `-author:app/${app}`),
			'sort:created-desc',
		].join(' '),
		first: CODE_CONTRIBUTIONS_LIMIT,
	});
	if (!result.success) {
		return resultFail(result.error);
	}
	const { data } = result;
	if (!isRecord(data) || !isPullRequestSearch(data.authored) || !isPullRequestSearch(data.reviewed)) {
		console.warn('GitHub pull request data is invalid');

		return resultFail('GitHub pull request data is invalid');
	}

	const withRole = (search: PullRequestSearch, role: GithubCodeContribution['role']) =>
		search.nodes.filter((node) => node.author?.__typename !== 'Bot').map((node) => ({ node, role }));

	return resultOk({
		total: data.authored.issueCount + data.reviewed.issueCount,
		items: [...withRole(data.authored, 'author'), ...withRole(data.reviewed, 'reviewer')]
			.sort((left, right) => right.node.mergedAt.localeCompare(left.node.mergedAt))
			.slice(0, CODE_CONTRIBUTIONS_LIMIT)
			.map(({ node, role }) => ({ title: node.title, url: node.url, role })),
	});
};

export const getOpenSourceStats = async (): Promise<Result<GithubRepoStats>> => {
	const repoResult = await fetchGithubData('');
	if (!repoResult.success) {
		return resultFail(repoResult.error);
	}
	if (!isRepoResponse(repoResult.data.data)) {
		return resultFail('GitHub repository data is invalid');
	}

	const [commitsResult, forksResult] = await Promise.all([loadCommitStats(), countRecentForks()]);
	if (!commitsResult.success) {
		return resultFail(commitsResult.error);
	}
	if (!forksResult.success) {
		return resultFail(forksResult.error);
	}

	return resultOk({
		...commitsResult.data,
		totalStars: repoResult.data.data.stargazers_count,
		totalForks: repoResult.data.data.forks_count,
		newForks: forksResult.data,
	});
};

export const getOpenSourceContributors = async (): Promise<Result<GithubContributor[]>> => {
	const contributors: GithubContributor[] = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const result = await fetchGithubData(`/contributors?per_page=100&page=${page}`);
		if (!result.success) {
			return resultFail(result.error);
		}
		if (isEmptyRecord(result.data.data)) {
			break;
		}
		if (!isContributorResponse(result.data.data)) {
			return resultFail('GitHub contributor data is invalid');
		}
		if (result.data.data.length === 0) {
			break;
		}

		contributors.push(
			...result.data.data
				.filter(({ login }) => !HIDDEN_CONTRIBUTOR_LOGINS.has(login))
				.map(({ id, login, avatar_url: avatarUrl, contributions: commits }) => ({
					id,
					name: login,
					commits,
					avatarUrl,
				})),
		);
		hasMore = result.data.data.length === 100;
		page++;
	}

	return resultOk(contributors.sort((left, right) => right.commits - left.commits));
};

export const getOpenSourceIssues = async (): Promise<Result<GithubOpenSourceIssuesData>> => {
	const issues: GithubIssue[] = [];
	const labels = new Set<string>();
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const result = await fetchGithubData(`/issues?state=open&per_page=100&page=${page}`);
		if (!result.success) {
			return resultFail(result.error);
		}
		if (!isIssueResponse(result.data.data)) {
			return resultFail('GitHub issue data is invalid');
		}
		if (result.data.data.length === 0) {
			break;
		}

		for (const issue of result.data.data.filter((item) => !item.pull_request)) {
			const issueLabels = issue.labels.map(({ name }) => name);
			issueLabels.forEach((label) => labels.add(label));
			issues.push({
				id: issue.id,
				url: issue.html_url,
				title: issue.title,
				labels: issueLabels,
			});
		}
		hasMore = result.data.data.length === 100;
		page++;
	}

	return resultOk({ issues, labels: [...labels] });
};

const loadCommitStats = async (): Promise<Result<{ totalCommits: number; newCommits: number }>> => {
	const endDate = now().toISOString();
	const startDate = now();
	startDate.setDate(startDate.getDate() - 30);

	const recentResult = await fetchGithubData(`/commits?since=${startDate.toISOString()}&until=${endDate}`);
	if (!recentResult.success) {
		return resultFail(recentResult.error);
	}
	if (!Array.isArray(recentResult.data.data)) {
		return resultFail('GitHub commit data is invalid');
	}

	const totalResult = await fetchGithubData('/commits?per_page=1');
	if (!totalResult.success) {
		return resultFail(totalResult.error);
	}

	const lastPage = totalResult.data.linkHeader?.match(/&page=(\d+)>; rel="last"/)?.[1];

	return resultOk({
		totalCommits: lastPage ? Number.parseInt(lastPage, 10) : 1,
		newCommits: recentResult.data.data.length,
	});
};

const countRecentForks = async (): Promise<Result<number>> => {
	const since = now();
	since.setDate(since.getDate() - 30);

	let newForks = 0;
	let page = 1;
	let hasMore = true;
	while (hasMore) {
		const result = await fetchGithubData(`/forks?per_page=100&page=${page}`);
		if (!result.success) {
			return resultFail(result.error);
		}
		if (!isForkResponse(result.data.data)) {
			return resultFail('GitHub fork data is invalid');
		}

		newForks += result.data.data.filter(({ created_at: createdAt }) => new Date(createdAt) >= since).length;
		hasMore = result.data.data.length === 100;
		page++;
	}

	return resultOk(newForks);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

const isEmptyRecord = (value: unknown): boolean => isRecord(value) && Object.keys(value).length === 0;

const isRepoResponse = (value: unknown): value is { stargazers_count: number; forks_count: number } =>
	isRecord(value) && typeof value.stargazers_count === 'number' && typeof value.forks_count === 'number';

const isContributorResponse = (
	value: unknown,
): value is { id: number; login: string; avatar_url: string; contributions: number }[] =>
	Array.isArray(value) &&
	value.every(
		(item) =>
			isRecord(item) &&
			typeof item.id === 'number' &&
			typeof item.login === 'string' &&
			typeof item.avatar_url === 'string' &&
			typeof item.contributions === 'number',
	);

const isIssueResponse = (
	value: unknown,
): value is {
	id: number;
	html_url: string;
	title: string;
	labels: { name: string }[];
	pull_request?: unknown;
}[] =>
	Array.isArray(value) &&
	value.every(
		(item) =>
			isRecord(item) &&
			typeof item.id === 'number' &&
			typeof item.html_url === 'string' &&
			typeof item.title === 'string' &&
			Array.isArray(item.labels) &&
			item.labels.every((label) => isRecord(label) && typeof label.name === 'string'),
	);

const isForkResponse = (value: unknown): value is { created_at: string }[] =>
	Array.isArray(value) && value.every((item) => isRecord(item) && typeof item.created_at === 'string');

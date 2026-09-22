import { fetchGithubData } from '@/integrations/github/github.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { now } from '@/lib/utils/now';
import type { GithubContributor, GithubIssue, GithubOpenSourceIssuesData, GithubRepoStats } from './github.types';

const RENOVATE_BOT_LOGIN = 'renovate[bot]';

export const getOpenSourceStats = async (): Promise<ServiceResult<GithubRepoStats>> => {
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

export const getOpenSourceContributors = async (): Promise<ServiceResult<GithubContributor[]>> => {
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
				.filter(({ login }) => login !== RENOVATE_BOT_LOGIN)
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

export const getOpenSourceIssues = async (): Promise<ServiceResult<GithubOpenSourceIssuesData>> => {
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

const loadCommitStats = async (): Promise<ServiceResult<{ totalCommits: number; newCommits: number }>> => {
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

const countRecentForks = async (): Promise<ServiceResult<number>> => {
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

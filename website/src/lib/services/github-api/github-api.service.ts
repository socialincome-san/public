import { BaseService } from '@/lib/services/core/base.service';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { now } from '@/lib/utils/now';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import type { GithubContributor, GithubIssue, GithubOpenSourceIssuesData, GithubRepoStats } from './github-api.types';

const OWNER = 'socialincome-san';
const REPO = 'public';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const GITHUB_REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_ERROR_DETAILS_LENGTH = 200;

const isRateLimitResponse = (status: number, headers: Headers, details: string) => {
	if (status === 429) {
		return true;
	}

	if (status !== 403) {
		return false;
	}

	if (headers.get('x-ratelimit-remaining') === '0' || headers.get('retry-after')) {
		return true;
	}

	return details.toLowerCase().includes('rate limit');
};

export class GithubApiService extends BaseService {
	async getOpenSourceStats(): Promise<ServiceResult<GithubRepoStats>> {
		return this.withGithubErrorHandling(() => this.loadRepoStats());
	}

	async getOpenSourceContributors(): Promise<ServiceResult<GithubContributor[]>> {
		return this.withGithubErrorHandling(() => this.loadContributors());
	}

	async getOpenSourceIssues(): Promise<ServiceResult<GithubOpenSourceIssuesData>> {
		return this.withGithubErrorHandling(() => this.loadIssues());
	}

	private async withGithubErrorHandling<T>(operation: () => Promise<T>): Promise<ServiceResult<T>> {
		try {
			return this.resultOk(await operation());
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			console.error(`${SLACK_ALERT}: GitHub open-source data fetch failed: ${message}`, { error });

			return this.resultFail(`Could not fetch GitHub data: ${message}`);
		}
	}

	private async fetchGithub(url: string) {
		const headers: Record<string, string> = {
			Accept: 'application/vnd.github+json',
		};

		if (process.env.GITHUB_PAT) {
			headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
		}

		const response = await fetch(url, { headers, next: { revalidate: GITHUB_REVALIDATE_SECONDS } });

		if (!response.ok) {
			const details = await response.text();
			const truncatedDetails = details.slice(0, MAX_ERROR_DETAILS_LENGTH);

			if (isRateLimitResponse(response.status, response.headers, details)) {
				throw new Error('GitHub API rate limit exceeded.');
			}

			if (response.status === 403) {
				throw new Error(`GitHub API request forbidden (403): ${truncatedDetails}`);
			}

			if (response.status === 404) {
				throw new Error(`GitHub repository ${OWNER}/${REPO} not found.`);
			}

			throw new Error(`GitHub request failed (${response.status}): ${truncatedDetails}`);
		}

		return response;
	}

	private async loadRepoStats(): Promise<GithubRepoStats> {
		const repoResponse = await this.fetchGithub(API_BASE);
		const repoData = (await repoResponse.json()) as { stargazers_count: number; forks_count: number };

		const [commits, newForks] = await Promise.all([this.loadCommitStats(), this.countRecentForks()]);

		return {
			...commits,
			totalStars: repoData.stargazers_count,
			totalForks: repoData.forks_count,
			newForks,
		};
	}

	private async loadCommitStats() {
		const endDate = now().toISOString();
		const startDate = now();
		startDate.setDate(startDate.getDate() - 30);

		const recentCommitsResponse = await this.fetchGithub(
			`${API_BASE}/commits?since=${startDate.toISOString()}&until=${endDate}`,
		);
		const recentCommits = (await recentCommitsResponse.json()) as unknown[];

		const totalCommitsResponse = await this.fetchGithub(`${API_BASE}/commits?per_page=1`);
		const linkHeader = totalCommitsResponse.headers.get('link');
		let totalCommits = 1;

		if (linkHeader) {
			const match = /&page=(\d+)>; rel="last"/.exec(linkHeader);
			if (match) {
				totalCommits = Number.parseInt(match[1], 10);
			}
		}

		return { totalCommits, newCommits: recentCommits.length };
	}

	private async countRecentForks() {
		const since = now();
		since.setDate(since.getDate() - 30);

		let newForks = 0;
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const response = await this.fetchGithub(`${API_BASE}/forks?per_page=100&page=${page}`);
			const forks = (await response.json()) as { created_at: string }[];

			for (const fork of forks) {
				if (new Date(fork.created_at) >= since) {
					newForks++;
				}
			}

			hasMore = forks.length === 100;
			page++;
		}

		return newForks;
	}

	private async loadContributors(): Promise<GithubContributor[]> {
		const contributors: GithubContributor[] = [];
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const response = await this.fetchGithub(`${API_BASE}/contributors?per_page=100&page=${page}`);
			const data: unknown = await response.json();

			if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
				break;
			}

			if (!Array.isArray(data)) {
				throw new Error('Expected contributors to be an array.');
			}

			if (data.length === 0) {
				break;
			}

			contributors.push(
				...data.map((contributor: { id: number; login: string; avatar_url: string; contributions: number }) => ({
					id: contributor.id,
					name: contributor.login,
					commits: contributor.contributions,
					avatarUrl: contributor.avatar_url,
				})),
			);

			hasMore = data.length === 100;
			page++;
		}

		return contributors.sort((left, right) => right.commits - left.commits);
	}

	private async loadIssues(): Promise<GithubOpenSourceIssuesData> {
		const issues: GithubIssue[] = [];
		const labels: string[] = [];
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const response = await this.fetchGithub(`${API_BASE}/issues?state=open&per_page=100&page=${page}`);
			const data = (await response.json()) as {
				id: number;
				html_url: string;
				title: string;
				labels: { name: string }[];
				pull_request?: unknown;
			}[];

			if (data.length === 0) {
				break;
			}

			for (const issue of data.filter((item) => !item.pull_request)) {
				const issueLabels = issue.labels.map((label) => label.name);

				for (const label of issueLabels) {
					if (!labels.includes(label)) {
						labels.push(label);
					}
				}

				issues.push({
					id: issue.id,
					url: issue.html_url,
					title: issue.title,
					labels: issueLabels,
				});
			}

			hasMore = data.length === 100;
			page++;
		}

		return { issues, labels };
	}
}

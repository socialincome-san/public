import { BaseService } from '@/lib/services/core/base.service';
import type { ServiceResult } from '@/lib/services/core/base.types';
import { now } from '@/lib/utils/now';
import type { GithubContributor, GithubIssue, GithubOpenSourcePageData, GithubRepoStats } from './github-api.types';

const OWNER = 'socialincome-san';
const REPO = 'public';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const GITHUB_REVALIDATE_SECONDS = 60 * 60 * 24;

export class GithubApiService extends BaseService {
	async getOpenSourcePageData(): Promise<ServiceResult<GithubOpenSourcePageData>> {
		try {
			const [stats, contributors, issuesData] = await Promise.all([
				this.loadRepoStats(),
				this.loadContributors(),
				this.loadIssues(),
			]);

			return this.resultOk({
				stats,
				contributors,
				issues: issuesData.issues,
				labels: issuesData.labels,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not fetch GitHub data: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	private async fetchGithub(url: string, options?: { accept?: string }) {
		const headers: Record<string, string> = {
			Accept: options?.accept ?? 'application/vnd.github+json',
		};

		if (process.env.GITHUB_PAT) {
			headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
		}

		const response = await fetch(url, { headers, next: { revalidate: GITHUB_REVALIDATE_SECONDS } });

		if (!response.ok) {
			const details = await response.text();

			if (response.status === 403) {
				throw new Error('GitHub API rate limit exceeded.');
			}

			if (response.status === 404) {
				throw new Error(`GitHub repository ${OWNER}/${REPO} not found.`);
			}

			throw new Error(`GitHub request failed (${response.status}): ${details}`);
		}

		return response;
	}

	private async loadRepoStats(): Promise<GithubRepoStats> {
		const repoResponse = await this.fetchGithub(API_BASE);
		const repoData = (await repoResponse.json()) as { stargazers_count: number; forks_count: number };

		const [commits, newStars, newForks] = await Promise.all([
			this.loadCommitStats(),
			this.countRecentStargazers(),
			this.countRecentForks(),
		]);

		return {
			...commits,
			totalStars: repoData.stargazers_count,
			newStars,
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

	private async countRecentStargazers() {
		const since = now();
		since.setDate(since.getDate() - 30);
		const sinceIso = since.toISOString();

		let newStars = 0;
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const response = await this.fetchGithub(`${API_BASE}/stargazers?per_page=100&page=${page}`, {
				accept: 'application/vnd.github.v3.star+json',
			});
			const stars = (await response.json()) as { starred_at?: string }[];

			for (const star of stars) {
				if (star.starred_at && new Date(star.starred_at) >= new Date(sinceIso)) {
					newStars++;
				}
			}

			hasMore = stars.length === 100;
			page++;
		}

		return newStars;
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

	private async loadIssues(): Promise<{ issues: GithubIssue[]; labels: string[] }> {
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

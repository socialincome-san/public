import { resultFail, resultOk, type Result } from '@/lib/result';

const OWNER = 'socialincome-san';
const REPO = 'public';
const API_ROOT = 'https://api.github.com';
const API_BASE = `${API_ROOT}/repos/${OWNER}/${REPO}`;
const GITHUB_REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_ERROR_DETAILS_LENGTH = 200;

type GithubResponse = {
	data: unknown;
	linkHeader: string | null;
};

export const fetchGithubData = async (path: string): Promise<Result<GithubResponse>> =>
	fetchGithubUrl(`${API_BASE}${path}`, path);

/** Searches issues and pull requests of this repository. The query is scoped to the repository automatically. */
export const searchGithubIssues = async (query: string, perPage = 1): Promise<Result<GithubResponse>> => {
	const path = `/search/issues?q=${encodeURIComponent(`repo:${OWNER}/${REPO} ${query}`)}&per_page=${perPage}`;

	return fetchGithubUrl(`${API_ROOT}${path}`, path);
};

const fetchGithubUrl = async (url: string, path: string): Promise<Result<GithubResponse>> => {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};

	if (process.env.GITHUB_PAT) {
		headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
	}

	try {
		const response = await fetch(url, {
			headers,
			next: { revalidate: GITHUB_REVALIDATE_SECONDS },
		});
		if (!response.ok) {
			const details = await response.text();
			console.error('GitHub API request failed', {
				path,
				status: response.status,
				details: details.slice(0, MAX_ERROR_DETAILS_LENGTH),
			});

			if (isRateLimitResponse(response.status, response.headers, details)) {
				return resultFail('GitHub API rate limit exceeded');
			}
			if (response.status === 403) {
				return resultFail('GitHub API request forbidden');
			}
			if (response.status === 404) {
				return resultFail('GitHub repository not found');
			}

			return resultFail('GitHub API request failed');
		}

		const data: unknown = await response.json();

		return resultOk({
			data,
			linkHeader: response.headers.get('link'),
		});
	} catch (error) {
		console.error('Could not fetch GitHub data', { path, error });

		return resultFail('Could not fetch GitHub data');
	}
};

const isRateLimitResponse = (status: number, headers: Headers, details: string): boolean => {
	if (status === 429) {
		return true;
	}
	if (status !== 403) {
		return false;
	}

	return (
		headers.get('x-ratelimit-remaining') === '0' ||
		headers.has('retry-after') ||
		details.toLowerCase().includes('rate limit')
	);
};

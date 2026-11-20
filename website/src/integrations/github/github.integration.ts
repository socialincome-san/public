import { resultFail, resultOk, type Result } from '@/lib/result';

const OWNER = 'socialincome-san';
const REPO = 'public';
const API_ROOT = 'https://api.github.com';
const REPO_PATH = `/repos/${OWNER}/${REPO}`;
const GITHUB_REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_ERROR_DETAILS_LENGTH = 200;

type GithubResponse = {
	data: unknown;
	linkHeader: string | null;
};

export const fetchGithubData = (path: string): Promise<Result<GithubResponse>> => requestGithub(`${REPO_PATH}${path}`);

const GRAPHQL_TIMEOUT_MS = 10_000;

export const GITHUB_REPOSITORY = `${OWNER}/${REPO}`;

const hasGraphqlData = (value: unknown): value is { data: unknown; errors?: unknown } =>
	typeof value === 'object' && value !== null && 'data' in value;

/**
 * Runs a GraphQL query and returns its `data`. GraphQL needs a token. It is not cached here, so call it from a
 * `'use cache'` scope.
 */
export const fetchGithubGraphql = async (
	query: string,
	variables: Record<string, string | number>,
): Promise<Result<unknown>> => {
	const token = process.env.GITHUB_PAT;
	if (!token) {
		console.warn('GITHUB_PAT is not set, skipping the GitHub GraphQL request');

		return resultFail('GitHub token is missing');
	}

	try {
		const response = await fetch(`${API_ROOT}/graphql`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ query, variables }),
			// A slow GitHub must not hold up the page that asks
			signal: AbortSignal.timeout(GRAPHQL_TIMEOUT_MS),
		});
		if (!response.ok) {
			const details = await response.text();
			console.warn('GitHub GraphQL request failed', {
				status: response.status,
				details: details.slice(0, MAX_ERROR_DETAILS_LENGTH),
			});

			return resultFail(
				isRateLimitResponse(response.status, response.headers, details)
					? 'GitHub API rate limit exceeded'
					: 'GitHub API request failed',
			);
		}
		const body: unknown = await response.json();
		// GraphQL reports its own errors, such as a used up rate limit, with status 200
		if (!hasGraphqlData(body) || body.errors !== undefined || body.data === null) {
			console.warn('GitHub GraphQL request returned errors', {
				details: JSON.stringify(body).slice(0, MAX_ERROR_DETAILS_LENGTH),
			});

			return resultFail('GitHub API request failed');
		}

		return resultOk(body.data);
	} catch (error) {
		console.warn('Could not fetch GitHub data', { error });

		return resultFail('Could not fetch GitHub data');
	}
};

const requestGithub = async (path: string): Promise<Result<GithubResponse>> => {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};

	if (process.env.GITHUB_PAT) {
		headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
	}

	try {
		const response = await fetch(`${API_ROOT}${path}`, {
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

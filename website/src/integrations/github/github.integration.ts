import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';

const OWNER = 'socialincome-san';
const REPO = 'public';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const GITHUB_REVALIDATE_SECONDS = 60 * 60 * 24;
const MAX_ERROR_DETAILS_LENGTH = 200;

type GithubResponse = {
	data: unknown;
	linkHeader: string | null;
};

export const fetchGithubData = async (path: string): Promise<ServiceResult<GithubResponse>> => {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};

	if (process.env.GITHUB_PAT) {
		headers.Authorization = `Bearer ${process.env.GITHUB_PAT}`;
	}

	try {
		const response = await fetch(`${API_BASE}${path}`, {
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

		return resultOk({
			data: await response.json(),
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

const owner = 'socialincome-san';
const repo = 'public';

interface Contributor {
	id: number;
	name: string;
	commits: number;
	avatarUrl: string;
}

interface GitHubContributor {
	author: {
		id: number;
		login: string;
		avatar_url: string;
	};
	total: number;
}

export async function getContributors(): Promise<Contributor[]> {
	const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/contributors`);

	if (!res.ok) {
		const errorDetails = await res.text();
		const status = res.status;
		if (status === 403 && errorDetails.includes('API rate limit exceeded')) {
			throw new Error(
				'GitHub API rate limit exceeded. Please try again later or increase rate limit by authenticating.',
			);
		} else if (status === 404) {
			throw new Error(`GitHub repository ${owner}/${repo} not found.`);
		} else {
			throw new Error(`Failed to fetch contributors from GitHub: ${status} - ${errorDetails}`);
		}
	}

	const contributors = await res.json();

	// Check if the response is an empty object
	if (Object.keys(contributors).length === 0) {
		console.warn('No contributor data available. The API returned an empty object.');
		return [];  // Return an empty array if no data is available
	}

	if (!Array.isArray(contributors)) {
		throw new Error('Expected contributors to be an array, but received a different format.');
	}

	return contributors
		.map((contributor: GitHubContributor) => ({
			id: contributor.author.id,
			name: contributor.author.login,
			commits: contributor.total,
			avatarUrl: contributor.author.avatar_url,
		}))
		.sort((a: Contributor, b: Contributor) => b.commits - a.commits);
}

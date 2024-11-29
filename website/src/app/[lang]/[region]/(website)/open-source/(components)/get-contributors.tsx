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
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};
	// Conditionally add the Authorization header if GITHUB_PAT is available
	if (process.env.GITHUB_PAT) {
		headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
	}
	const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/stats/contributors`, {
		headers,
	});

	if (!res.ok) {
		const errorDetails = await res.text();
		const status = res.status;
		if (status === 403) {
			throw new Error(`GitHub API rate limit exceeded: ${status} - ${errorDetails}.`);
		} else if (status === 404) {
			throw new Error(`GitHub repository ${owner}/${repo} not found.`);
		} else {
			throw new Error(`Failed to fetch contributors from GitHub: ${status} - ${errorDetails}`);
		}
	}

	const contributors = await res.json();

	if (Object.keys(contributors).length === 0) {
		console.warn('No contributor data available. The API returned an empty object.');
		return [];
	}

	if (!Array.isArray(contributors)) {
		throw new Error('Expected contributors to be an array, but received a different format.');
	}

	return contributors
		.filter((contributor: GitHubContributor) => contributor.author != null)
		.map((contributor: GitHubContributor) => ({
				id: contributor.author.id,
				name: contributor.author.login,
				commits: contributor.total,
				avatarUrl: contributor.author.avatar_url,
		}))
		.sort((a: Contributor, b: Contributor) => b.commits - a.commits);
}

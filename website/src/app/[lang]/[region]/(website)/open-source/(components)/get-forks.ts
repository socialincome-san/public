const owner = 'socialincome-san';
const repo = 'public';

interface GitHubFork {
	id: number;
	created_at: string;
}

export async function getForkCount(): Promise<{ totalForks: number; newForks: number }> {
	const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};
	// Conditionally add the Authorization header if GITHUB_PAT is available
	if (process.env.GITHUB_PAT) {
		headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
	}
	const repoRes = await fetch(repoUrl, { headers });

	if (!repoRes.ok) {
		const errorDetails = await repoRes.text();
		const status = repoRes.status;
		if (status === 403) {
			throw new Error(`GitHub API rate limit exceeded: ${status} - ${errorDetails}.`);
		} else if (status === 404) {
			throw new Error(`GitHub repository ${owner}/${repo} not found.`);
		} else {
			throw new Error(`Failed to fetch repository info from GitHub: ${status} - ${errorDetails}`);
		}
	}

	const repoData = await repoRes.json();
	const totalForks = repoData.forks_count;

	// Calculate the date 30 days ago from today
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);
	const startDateISO = startDate.toISOString();

	// Fetch recent forks within the last 30 days
	const forksUrl = `https://api.github.com/repos/${owner}/${repo}/forks?per_page=100`;
	let newForks = 0;
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const pagedRes = await fetch(`${forksUrl}&page=${page}`, {
			headers,
		});

		if (!pagedRes.ok) {
			const errorDetails = await pagedRes.text();
			const status = pagedRes.status;

			if (status === 403 && errorDetails.includes('API rate limit exceeded')) {
				throw new Error(
					'GitHub API rate limit exceeded during forks fetching. Please try again later or increase rate limit by authenticating.',
				);
			} else if (status === 404) {
				throw new Error(`GitHub repository ${owner}/${repo} forks not found.`);
			} else {
				throw new Error(`Failed to fetch forks from GitHub: ${status} - ${errorDetails}`);
			}
		}

		const forks: GitHubFork[] = await pagedRes.json();

		// Count new forks within the last 30 days
		for (const fork of forks) {
			if (new Date(fork.created_at) >= new Date(startDateISO)) {
				newForks++;
			}
		}

		// No more pages if we got fewer than 100 forks
		if (forks.length < 100) hasMore = false;
		page++;
	}

	return { totalForks, newForks };
}

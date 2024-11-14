const owner = 'socialincome-san';
const repo = 'public';

interface GitHubStar {
	user: {
		id: number;
		login: string;
	};
	starred_at: string;
}

export async function getStarCount(): Promise<{ totalStars: number; newStars: number }> {
	const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
	const repoRes = await fetch(repoUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_PAT}`,
			Accept: 'application/vnd.github+json',
		},
	});

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
	const totalStars = repoData.stargazers_count;

	// Calculate the date 30 days ago from today
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);
	const startDateISO = startDate.toISOString();

	// Fetch stargazers with timestamps within the last 30 days
	const starUrl = `https://api.github.com/repos/${owner}/${repo}/stargazers?per_page=100`;
	let newStars = 0;
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const pagedRes = await fetch(`${starUrl}&page=${page}`, {
			headers: {
				Authorization: `Bearer ${process.env.GITHUB_PAT}`,
				Accept: 'application/vnd.github.star+json',
			},
		});

		if (!pagedRes.ok) {
			const errorDetails = await pagedRes.text();
			const status = pagedRes.status;

			if (status === 403 && errorDetails.includes('API rate limit exceeded')) {
				throw new Error(
					'GitHub API rate limit exceeded during stargazers fetching. Please try again later or increase rate limit by authenticating.',
				);
			} else if (status === 404) {
				throw new Error(`GitHub repository ${owner}/${repo} stargazers not found.`);
			} else {
				throw new Error(`Failed to fetch stargazers from GitHub: ${status} - ${errorDetails}`);
			}
		}

		const stars: GitHubStar[] = await pagedRes.json();

		// Count new stars within the last 30 days
		for (const star of stars) {
			const starredAt = new Date(star.starred_at);
			if (starredAt >= new Date(startDateISO)) {
				newStars++;
			}
		}

		// No more pages if we got fewer than 100 stars
		if (stars.length < 100) hasMore = false;
		page++;
	}

	return { totalStars, newStars };
}

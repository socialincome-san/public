import { fetchData } from './fetch-data';

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
	const repoRes = await fetchData(owner, repo, repoUrl);

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
		const pagedRes = await fetchData(owner, repo, `${starUrl}&page=${page}`);
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

import { now } from '@/lib/utils/now';
import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

interface GitHubFork {
	id: number;
	created_at: string;
}

export const getForkCount = async (): Promise<{ totalForks: number; newForks: number }> => {
	const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
	const repoDataRes = await fetchData(owner, repo, repoUrl);
	const repoData = await repoDataRes.json();
	const totalForks = repoData.forks_count;

	// Calculate the date 30 days ago from today
	const startDate = now();
	startDate.setDate(startDate.getDate() - 30);
	const startDateISO = startDate.toISOString();

	// Fetch recent forks within the last 30 days
	const forksUrl = `https://api.github.com/repos/${owner}/${repo}/forks?per_page=100`;
	let newForks = 0;
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const pagedRes = await fetchData(owner, repo, `${forksUrl}&page=${page}`);
		const forks: GitHubFork[] = await pagedRes.json();

		// Count new forks within the last 30 days
		for (const fork of forks) {
			if (new Date(fork.created_at) >= new Date(startDateISO)) {
				newForks++;
			}
		}

		// No more pages if we got fewer than 100 forks
		if (forks.length < 100) {
			hasMore = false;
		}
		page++;
	}

	return { totalForks, newForks };
}

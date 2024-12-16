import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

interface GitHubCommit {
	author: {
		id: number;
		login: string;
		avatar_url: string;
	} | null;
	commit: {
		author: {
			date: string;
		};
	};
}

export async function getCommits() {
	// Calculate the date 30 days ago from today
	const endDate = new Date().toISOString();
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - 30);
	const startDateISO = startDate.toISOString();

	// Fetch recent commits from the last 30 days
	const commitUrl = `https://api.github.com/repos/${owner}/${repo}/commits?since=${startDateISO}&until=${endDate}`;
	const recentCommitsRes = await fetchData(owner, repo, commitUrl);
	const recentCommits: GitHubCommit[] = await recentCommitsRes.json();

	// Fetch total commit count
	const totalCommitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
	const totalCommitsRes = await fetchData(owner, repo, totalCommitsUrl);

	// Extract the last page number from the Link header to get the total commit count
	const linkHeader = totalCommitsRes.headers.get('link');
	// Default to 1 in case no Link header is provided
	let totalCommits = 1;

	if (linkHeader) {
		const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
		if (match) {
			totalCommits = parseInt(match[1], 10);
		} else {
			console.warn('Link header exists but could not parse total commits page count.');
		}
	} else {
		console.warn('No Link header found; assuming a single commit.');
	}

	return {
		totalCommits,
		newCommits: recentCommits.length,
	};
}

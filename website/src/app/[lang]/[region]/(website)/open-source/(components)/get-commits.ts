import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

interface GitHubCommit {
	author: {
		id: number;
		login: string;
		avatar_url: string;
	};
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

	// Fetch total commit data
	let totalCommitsData: GitHubCommit[] = [];
	for (let page = 1; page <= Math.ceil(totalCommits / 100); page++) {
		const pagedUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=100&page=${page}`;
		const pagedRes = await fetchData(owner, repo, pagedUrl);
		const pagedData: GitHubCommit[] = await pagedRes.json();
		totalCommitsData = totalCommitsData.concat(pagedData);
	}

	// return the total number of commits,
	// the total number of commits made in the last 30 days, and the total commit data
	return {
		totalCommits,
		newCommits: recentCommits.length,
		totalCommitsData,
	};
}

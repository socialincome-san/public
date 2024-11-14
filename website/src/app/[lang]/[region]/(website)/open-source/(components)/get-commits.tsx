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
	const res = await fetch(commitUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_PAT}`,
			Accept: 'application/vnd.github+json',
		},
	});

	if (!res.ok) {
		const errorDetails = await res.text();
		const status = res.status;
		if (status === 403) {
			throw new Error(
				'GitHub API rate limit exceeded. Please try again later or increase rate limit by authenticating.',
			);
		} else if (status === 404) {
			throw new Error(`GitHub repository ${owner}/${repo} not found.`);
		} else {
			throw new Error(`Failed to fetch recent commits from GitHub: ${status} - ${errorDetails}`);
		}
	}

	const recentCommits: GitHubCommit[] = await res.json();

	// Fetch total commit count
	const totalCommitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`;
	const totalCommitsRes = await fetch(totalCommitsUrl, {
		headers: {
			Authorization: `Bearer ${process.env.GITHUB_PAT}`,
			Accept: 'application/vnd.github+json',
		},
	});

	if (!totalCommitsRes.ok) {
		const errorDetails = await totalCommitsRes.text();
		const status = totalCommitsRes.status;
		if (status === 403) {
			throw new Error(`GitHub API rate limit exceeded: ${status} - ${errorDetails}.`);
		} else if (status === 404) {
			throw new Error(`GitHub repository ${owner}/${repo} not found while fetching total commits.`);
		} else {
			throw new Error(`Failed to fetch total commits from GitHub: ${status} - ${errorDetails}`);
		}
	}

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

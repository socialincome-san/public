export const fetchData = async (owner: string, repo: string, url: string) => {
	const headers: Record<string, string> = {
		Accept: 'application/vnd.github+json',
	};
	// Conditionally add the Authorization header if GITHUB_PAT is available
	if (process.env.GITHUB_PAT) {
		headers['Authorization'] = `Bearer ${process.env.GITHUB_PAT}`;
	}
	const res = await fetch(url, {
		headers,
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

	return res;
}

import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

interface Contributor {
	id: number;
	name: string;
	commits: number;
	avatarUrl: string;
}

interface GitHubContributor {
	id: number;
	login: string;
	avatar_url: string;
	contributions: number;
}

export const getContributors = async () => {
	const url = `https://api.github.com/repos/${owner}/${repo}/contributors`;
	const contributorsRes = await fetchData(owner, repo, url);
	const contributors = await contributorsRes.json();

	if (Object.keys(contributors).length === 0) {
		console.warn('No contributor data available. The API returned an empty object.');
		return [];
	}

	if (!Array.isArray(contributors)) {
		throw new Error('Expected contributors to be an array, but received a different format.');
	}

	return contributors
		.map((contributor: GitHubContributor) => ({
			id: contributor.id,
			name: contributor.login,
			commits: contributor.contributions,
			avatarUrl: contributor.avatar_url,
		}))
		.sort((a: Contributor, b: Contributor) => b.commits - a.commits);
}

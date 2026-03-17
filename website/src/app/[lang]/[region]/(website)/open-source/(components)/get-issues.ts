import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

type Issue = {
	id: number;
	url: string;
	title: string;
	labels: string[];
};

type IssuesResponse = {
	issues: Issue[];
	labels: string[];
};

type GithubIssue = {
	id: number;
	html_url: string;
	title: string;
	labels: { name: string }[];
	pull_request?: unknown;
};

export const getIssuesData = async (): Promise<IssuesResponse> => {
	const issues: Issue[] = [];
	const labels: string[] = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100&page=${page}`;
		const res = await fetchData(owner, repo, url);
		const data = (await res.json()) as GithubIssue[];

		// Break if no more issues
		if (data.length === 0) {
			break;
		}

		// Exclude pull requests and map response to Issue interface
		const filteredIssues = data
			.filter((issue) => !issue.pull_request)
			.map((issue) => {
				const issueLabel = issue.labels.map((label) => label.name);

				issueLabel.forEach((label: string) => {
					if (!labels.includes(label)) {
						labels.push(label);
					}
				});

				return {
					id: issue.id,
					url: issue.html_url,
					title: issue.title,
					labels: issueLabel,
				};
			});

		issues.push(...filteredIssues);

		// Stop if fewer than 100 items were returned, indicating the last page
		hasMore = data.length === 100;
		page++;
	}

	return { issues, labels };
};

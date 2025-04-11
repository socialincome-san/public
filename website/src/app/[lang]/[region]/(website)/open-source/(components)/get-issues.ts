import { fetchData } from './fetch-data';

const owner = 'socialincome-san';
const repo = 'public';

interface Issue {
	id: number;
	url: string;
	title: string;
	labels: string[];
}

interface IssuesResponse {
	issues: Issue[];
	labels: string[];
}

export async function getIssuesData(): Promise<IssuesResponse> {
	const issues: Issue[] = [];
	const labels: string[] = [];
	let page = 1;
	let hasMore = true;

	while (hasMore) {
		const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=100&page=${page}`;
		const res = await fetchData(owner, repo, url);
		const data = await res.json();

		// Break if no more issues
		if (data.length === 0) break;

		// Exclude pull requests and map response to Issue interface
		const filteredIssues = data
			.filter((issue: any) => !issue.pull_request)
			.map((issue: any) => {
				const issueLabel = issue.labels.map((label: any) => label.name);

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
}

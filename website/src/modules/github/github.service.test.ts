import { getCodeContributions, getOpenSourceContributors } from './github.service';

describe('getOpenSourceContributors', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('excludes bots from the public contributor list', async () => {
		jest.spyOn(global, 'fetch').mockResolvedValue(
			new Response(
				JSON.stringify([
					{
						id: 29_139_614,
						login: 'renovate[bot]',
						avatar_url: 'https://avatars.githubusercontent.com/u/29139614',
						contributions: 356,
					},
					{
						id: 49_699_333,
						login: 'dependabot[bot]',
						avatar_url: 'https://avatars.githubusercontent.com/u/49699333',
						contributions: 42,
					},
					{
						id: 198_982_749,
						login: 'Copilot',
						avatar_url: 'https://avatars.githubusercontent.com/u/198982749',
						contributions: 12,
					},
					{
						id: 37_732_078,
						login: 'human-contributor',
						avatar_url: 'https://avatars.githubusercontent.com/u/37732078',
						contributions: 301,
					},
				]),
				{ status: 200, headers: { 'Content-Type': 'application/json' } },
			),
		);

		const result = await getOpenSourceContributors();

		expect(result).toEqual({
			success: true,
			status: undefined,
			data: [
				{
					id: 37_732_078,
					name: 'human-contributor',
					commits: 301,
					avatarUrl: 'https://avatars.githubusercontent.com/u/37732078',
				},
			],
		});
	});
});

describe('getCodeContributions', () => {
	const pullRequest = (number: number, mergedAt: string, authorType = 'User') => ({
		title: `Pull request ${number}`,
		url: `https://github.com/socialincome-san/public/pull/${number}`,
		mergedAt,
		author: { __typename: authorType },
	});
	const graphqlResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
	const emptySearch = { issueCount: 0, nodes: [] };

	beforeEach(() => {
		process.env.GITHUB_PAT = 'test-token';
		jest.spyOn(console, 'warn').mockImplementation(() => undefined);
	});

	afterEach(() => {
		delete process.env.GITHUB_PAT;
		jest.restoreAllMocks();
	});

	it('merges written and reviewed pull requests, newest merged first, and totals both searches', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
			graphqlResponse({
				data: {
					authored: {
						issueCount: 301,
						nodes: [pullRequest(1, '2026-02-01T10:00:00Z'), pullRequest(3, '2026-04-01T10:00:00Z')],
					},
					reviewed: {
						issueCount: 40,
						// An empty node is a result that is no pull request
						nodes: [pullRequest(2, '2026-03-01T10:00:00Z'), pullRequest(9, '2026-05-01T10:00:00Z', 'Bot')],
					},
				},
			}),
		);

		const result = await getCodeContributions(' Ada-Lovelace ');

		expect(result).toEqual({
			success: true,
			status: undefined,
			data: {
				total: 341,
				items: [
					{ title: 'Pull request 3', url: 'https://github.com/socialincome-san/public/pull/3', role: 'author' },
					{ title: 'Pull request 2', url: 'https://github.com/socialincome-san/public/pull/2', role: 'reviewer' },
					{ title: 'Pull request 1', url: 'https://github.com/socialincome-san/public/pull/1', role: 'author' },
				],
			},
		});
		expect(fetchSpy).toHaveBeenCalledTimes(1);
		const [url, init] = fetchSpy.mock.calls[0];
		expect(url).toBe('https://api.github.com/graphql');
		const sent: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
		expect(sent).toMatchObject({
			variables: {
				authored: 'repo:socialincome-san/public is:pr is:merged author:ada-lovelace sort:created-desc',
				reviewed:
					'repo:socialincome-san/public is:pr is:merged reviewed-by:ada-lovelace -author:ada-lovelace -author:app/renovate -author:app/dependabot -author:app/copilot-swe-agent -author:app/github-actions sort:created-desc',
				first: 100,
			},
		});
	});

	it('returns an empty list for a name without pull requests', async () => {
		jest
			.spyOn(global, 'fetch')
			.mockResolvedValue(graphqlResponse({ data: { authored: emptySearch, reviewed: emptySearch } }));

		expect(await getCodeContributions('ada-lovelace')).toMatchObject({ success: true, data: { total: 0, items: [] } });
	});

	it('does not ask GitHub without a token', async () => {
		delete process.env.GITHUB_PAT;
		const fetchSpy = jest.spyOn(global, 'fetch');

		expect((await getCodeContributions('ada-lovelace')).success).toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it('rejects a name that is no GitHub username', async () => {
		const fetchSpy = jest.spyOn(global, 'fetch');

		expect((await getCodeContributions('ada author:someone-else')).success).toBe(false);
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it.each([
		['GitHub limits the requests', () => Promise.resolve(new Response('rate limit', { status: 429 }))],
		['GitHub reports an error with status 200', () => Promise.resolve(graphqlResponse({ data: null, errors: [{}] }))],
		['the answer has another shape', () => Promise.resolve(graphqlResponse({ data: { authored: emptySearch } }))],
		['the answer is no JSON', () => Promise.resolve(new Response('<html>', { status: 200 }))],
		['the request fails or times out', () => Promise.reject(new Error('timeout'))],
	])('fails without throwing when %s', async (_case, respond) => {
		jest.spyOn(global, 'fetch').mockImplementation(respond);

		expect((await getCodeContributions('ada-lovelace')).success).toBe(false);
	});
});

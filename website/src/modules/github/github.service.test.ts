import { getOpenSourceContributors } from './github.service';

describe('getOpenSourceContributors', () => {
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('excludes Renovate from the public contributor list', async () => {
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

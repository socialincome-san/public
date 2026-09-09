import { parseCampaignsQueryParam } from './parse-campaigns-query-param';

describe('parseCampaignsQueryParam', () => {
	test('parses a comma-separated campaigns param', () => {
		expect(
			parseCampaignsQueryParam(
				'https://socialincome.org/auth/finish-login?email=ada%40example.com&campaigns=Ab12Cd34,Xy98Zk76',
			),
		).toEqual(['Ab12Cd34', 'Xy98Zk76']);
	});

	test('reads campaigns from a nested continueUrl', () => {
		const continueUrl = encodeURIComponent(
			'https://socialincome.org/auth/confirm-login?email=ada@example.com&campaigns=Ab12Cd34,Xy98Zk76',
		);

		expect(parseCampaignsQueryParam(`https://socialincome.org/auth/finish-login?continueUrl=${continueUrl}`)).toEqual([
			'Ab12Cd34',
			'Xy98Zk76',
		]);
	});

	test('returns an empty array when campaigns is missing or invalid', () => {
		expect(parseCampaignsQueryParam('https://socialincome.org/auth/finish-login?email=ada@example.com')).toEqual([]);
		expect(parseCampaignsQueryParam('not-a-url')).toEqual([]);
	});
});

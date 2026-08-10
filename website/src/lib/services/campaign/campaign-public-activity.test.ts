import { isCampaignPubliclyActive, matchesPublicCampaignActivity } from './campaign-public-activity';

const now = new Date('2025-06-15T12:00:00.000Z').getTime();

describe('isCampaignPubliclyActive', () => {
	test('is active when end date is in the future and goal has not been reached', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				amountCollected: 9_999,
				now,
			}),
		).toBe(true);
	});

	test('is inactive when end date is in the past', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date('2025-06-01T12:00:00.000Z'),
				goal: 10_000,
				amountCollected: 100,
				now,
			}),
		).toBe(false);
	});

	test('is inactive when end date is exactly now', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date(now),
				goal: null,
				amountCollected: null,
				now,
			}),
		).toBe(false);
	});

	test('is inactive when goal has been reached even if end date is in the future', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				amountCollected: 10_000,
				now,
			}),
		).toBe(false);
	});

	test('is active when there is no goal', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: null,
				amountCollected: 50_000,
				now,
			}),
		).toBe(true);
	});

	test('is active when collected amount is unknown', () => {
		expect(
			isCampaignPubliclyActive({
				endDate: new Date('2025-07-15T12:00:00.000Z'),
				goal: 10_000,
				amountCollected: null,
				now,
			}),
		).toBe(true);
	});
});

describe('matchesPublicCampaignActivity', () => {
	test.each([
		{ isActive: true, activity: 'active' as const, expected: true },
		{ isActive: false, activity: 'active' as const, expected: false },
		{ isActive: true, activity: 'inactive' as const, expected: false },
		{ isActive: false, activity: 'inactive' as const, expected: true },
		{ isActive: true, activity: 'all' as const, expected: true },
		{ isActive: false, activity: 'all' as const, expected: true },
	])('returns $expected for isActive=$isActive activity=$activity', ({ isActive, activity, expected }) => {
		expect(matchesPublicCampaignActivity(isActive, activity)).toBe(expected);
	});
});

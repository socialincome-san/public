import { getCampaignDaysRemaining } from '@/components/campaign/get-campaign-days-remaining';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const dateFrom = (base: Date, days: number) => new Date(base.getTime() + days * MS_PER_DAY);

describe('getCampaignDaysRemaining', () => {
	const createdAt = new Date('2026-08-20T00:00:00.000Z');
	const endDate = dateFrom(createdAt, 90);

	test('clamps remaining days to the campaign window when now is before the start', () => {
		const now = createdAt.getTime() - 594 * MS_PER_DAY;

		expect(getCampaignDaysRemaining({ endDate, createdAt, now })).toEqual({
			remainingDays: 90,
			progress: 0,
		});
	});

	test('returns full duration and empty progress at campaign start', () => {
		expect(getCampaignDaysRemaining({ endDate, createdAt, now: createdAt.getTime() })).toEqual({
			remainingDays: 90,
			progress: 0,
		});
	});

	test('returns remaining days and elapsed fraction while the campaign is running', () => {
		const now = dateFrom(createdAt, 45).getTime();

		expect(getCampaignDaysRemaining({ endDate, createdAt, now })).toEqual({
			remainingDays: 45,
			progress: 50,
		});
	});

	test('returns zero remaining days and full progress after the campaign has ended', () => {
		const now = dateFrom(endDate, 3).getTime();

		expect(getCampaignDaysRemaining({ endDate, createdAt, now })).toEqual({
			remainingDays: 0,
			progress: 100,
		});
	});
});

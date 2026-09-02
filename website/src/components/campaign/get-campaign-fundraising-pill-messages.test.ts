import {
	getCampaignFundraisingPillMessages,
	getSupporterGoal,
} from '@/components/campaign/get-campaign-fundraising-pill-messages';

const baseCampaign = {
	currency: 'CHF' as const,
	amountCollected: 0,
	numberOfContributions: 0,
};

describe('getSupporterGoal', () => {
	test('returns 10 when there are no contributions yet', () => {
		expect(getSupporterGoal(0)).toBe(10);
	});

	test('returns the next multiple of 10 when below a milestone', () => {
		expect(getSupporterGoal(9)).toBe(10);
		expect(getSupporterGoal(121)).toBe(130);
	});

	test('returns the next milestone when already on a multiple of 10', () => {
		expect(getSupporterGoal(10)).toBe(20);
		expect(getSupporterGoal(130)).toBe(140);
	});
});

describe('getCampaignFundraisingPillMessages', () => {
	test('includes days-left below the threshold and excludes it at the threshold', () => {
		expect(
			getCampaignFundraisingPillMessages({ ...baseCampaign, goal: 10_000 }, 19).some(
				(message) => message.type === 'days-left',
			),
		).toBe(true);
		expect(
			getCampaignFundraisingPillMessages({ ...baseCampaign, goal: 10_000 }, 20).some(
				(message) => message.type === 'days-left',
			),
		).toBe(false);
	});

	test('includes amount-missing below 20% remaining and excludes it at 20%', () => {
		const belowThreshold = getCampaignFundraisingPillMessages(
			{ ...baseCampaign, goal: 10_000, amountCollected: 8_100 },
			30,
		).find((message) => message.type === 'amount-missing');
		const atThreshold = getCampaignFundraisingPillMessages(
			{ ...baseCampaign, goal: 10_000, amountCollected: 8_000 },
			30,
		).find((message) => message.type === 'amount-missing');

		expect(belowThreshold).toEqual({
			type: 'amount-missing',
			missing: 1_900,
			goal: 10_000,
			currency: 'CHF',
		});
		expect(atThreshold).toBeUndefined();
	});

	test('excludes amount-missing when the goal has been reached', () => {
		expect(
			getCampaignFundraisingPillMessages({ ...baseCampaign, goal: 10_000, amountCollected: 10_000 }, 30).some(
				(message) => message.type === 'amount-missing',
			),
		).toBe(false);
	});

	test('always includes supporters-left with milestone math', () => {
		const messages = getCampaignFundraisingPillMessages({ ...baseCampaign, goal: 10_000, numberOfContributions: 121 }, 30);

		expect(messages.at(-1)).toEqual({
			type: 'supporters-left',
			supportersLeft: 9,
			supporterGoal: 130,
		});
	});

	test('returns messages in days, money, supporters order when all apply', () => {
		const messages = getCampaignFundraisingPillMessages(
			{ ...baseCampaign, goal: 12_300, amountCollected: 12_233, numberOfContributions: 121 },
			8,
		);

		expect(messages.map((message) => message.type)).toEqual(['days-left', 'amount-missing', 'supporters-left']);
	});
});

import type { CountryCode } from '@/generated/prisma/enums';

const mockFindSucceededContributionTotal = jest.fn();
const mockFindSucceededContributionsByContributorCountry = jest.fn();

jest.mock('./contribution.repository', () => ({
	findSucceededContributionTotal: mockFindSucceededContributionTotal,
	findSucceededContributionsByContributorCountry: mockFindSucceededContributionsByContributorCountry,
}));

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: jest.fn(),
}));

jest.mock('@/modules/contributors/contributor.service', () => ({
	findContributorById: jest.fn(),
	getEditableContributorOptions: jest.fn(),
}));

import { getSucceededContributionsByContributorCountry, getSucceededContributionTotal } from './contribution.service';

const contributionRow = (country: CountryCode, contributorId: string, amountChf: number) => ({
	amountChf,
	contributorId,
	contributor: {
		contact: {
			address: { country },
		},
	},
});

describe('public contribution totals', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns the succeeded CHF aggregate', async () => {
		mockFindSucceededContributionTotal.mockResolvedValue({ _sum: { amountChf: 125 } });

		expect(await getSucceededContributionTotal()).toEqual({ success: true, data: 125 });
	});

	test('aggregates contributor countries and counts each contributor once per country', async () => {
		mockFindSucceededContributionsByContributorCountry.mockResolvedValue([
			contributionRow('DE', 'contributor-1', 10),
			contributionRow('DE', 'contributor-1', 15),
			contributionRow('CH', 'contributor-2', 25),
		]);

		expect(await getSucceededContributionsByContributorCountry()).toEqual({
			success: true,
			data: [
				{ countryCode: 'DE', totalChf: 25, contributorCount: 1 },
				{ countryCode: 'CH', totalChf: 25, contributorCount: 1 },
			],
		});
	});

	test('returns a stable error when the country query fails', async () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		mockFindSucceededContributionsByContributorCountry.mockRejectedValue(new Error('Database unavailable'));

		expect(await getSucceededContributionsByContributorCountry()).toEqual({
			success: false,
			error: 'Could not fetch contributions by country',
		});
		consoleError.mockRestore();
	});
});

import { resultFail, resultOk } from '@/lib/service-result';

const mockFindProgramNameById = jest.fn();
const mockFindProgramOptions = jest.fn();
const mockFindProgramsByIds = jest.fn();
const mockCountProgramsCreatedBetween = jest.fn();
const mockFindProgramPayoutForecastSource = jest.fn();

jest.mock('./program.repository', () => ({
	findProgramNameById: mockFindProgramNameById,
	findProgramOptions: mockFindProgramOptions,
	findProgramsByIds: mockFindProgramsByIds,
	countProgramsCreatedBetween: mockCountProgramsCreatedBetween,
	findProgramPayoutForecastSource: mockFindProgramPayoutForecastSource,
}));

import {
	countProgramsCreatedBetween,
	getProgramNameById,
	getProgramPayoutForecastSource,
	getProgramReferenceOptions,
	validateProgramIds,
} from './program-reference.service';

describe('program reference service', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('returns a program name by id', async () => {
		mockFindProgramNameById.mockResolvedValue({ name: 'Sierra Leone' });

		await expect(getProgramNameById('program-1')).resolves.toEqual(resultOk('Sierra Leone'));
	});

	test('validates that all program ids exist', async () => {
		mockFindProgramsByIds.mockResolvedValue([{ id: 'program-1' }]);

		await expect(validateProgramIds(['program-1', 'program-1'])).resolves.toEqual(resultOk(true));
		await expect(validateProgramIds(['program-1', 'missing'])).resolves.toEqual(resultOk(false));
	});

	test('maps payout forecast decimals to numbers', async () => {
		mockFindProgramPayoutForecastSource.mockResolvedValue({
			programDurationInMonths: 12,
			payoutPerInterval: 800,
			payoutInterval: 'monthly',
			country: { currency: 'SLE' },
			recipients: [],
		});

		await expect(getProgramPayoutForecastSource('program-1')).resolves.toEqual(
			resultOk({
				programDurationInMonths: 12,
				payoutPerInterval: 800,
				payoutInterval: 'monthly',
				country: { currency: 'SLE' },
				recipients: [],
			}),
		);
	});

	test('returns not found when the payout forecast program is missing', async () => {
		mockFindProgramPayoutForecastSource.mockResolvedValue(null);

		await expect(getProgramPayoutForecastSource('missing')).resolves.toEqual(resultFail('Program not found'));
	});

	test('lists program reference options', async () => {
		mockFindProgramOptions.mockResolvedValue([{ id: 'program-1', name: 'Sierra Leone' }]);

		await expect(getProgramReferenceOptions()).resolves.toEqual(resultOk([{ id: 'program-1', name: 'Sierra Leone' }]));
	});

	test('counts programs created in a date range', async () => {
		mockCountProgramsCreatedBetween.mockResolvedValue(4);

		await expect(countProgramsCreatedBetween(new Date('2026-01-01'), new Date('2026-02-01'))).resolves.toEqual(resultOk(4));
	});
});

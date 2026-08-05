import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';

const mockGetEligiblePublicSubmissionProgramsAction = jest.fn();

jest.mock('@/lib/server-actions/campaign-public-actions', () => ({
	getEligiblePublicSubmissionProgramsAction: (...args: unknown[]) =>
		mockGetEligiblePublicSubmissionProgramsAction(...args),
}));

describe('getCachedEligiblePublicSubmissionPrograms', () => {
	beforeEach(() => {
		jest.resetModules();
		jest.clearAllMocks();
	});

	test('fetches once per language and reuses the successful result', async () => {
		const programs: PublicSubmissionProgramOption[] = [
			{
				id: 'program-1',
				name: 'Core',
				slug: 'si-core-sl',
				countryId: 'country-sl',
				countryIsoCode: 'SL',
				recipientsCount: 8,
				description: null,
				imageUrl: null,
				tags: ['Poverty'],
			},
		];
		mockGetEligiblePublicSubmissionProgramsAction.mockResolvedValue({ success: true, data: programs });

		const { getCachedEligiblePublicSubmissionPrograms, peekCachedEligiblePublicSubmissionPrograms } = await import(
			'./eligible-programs-session-cache'
		);

		expect(peekCachedEligiblePublicSubmissionPrograms('en')).toBeNull();

		const first = await getCachedEligiblePublicSubmissionPrograms('en');
		const second = await getCachedEligiblePublicSubmissionPrograms('en');

		expect(first).toEqual({ success: true, data: programs });
		expect(second).toEqual({ success: true, data: programs });
		expect(peekCachedEligiblePublicSubmissionPrograms('en')).toEqual(programs);
		expect(mockGetEligiblePublicSubmissionProgramsAction).toHaveBeenCalledTimes(1);
		expect(mockGetEligiblePublicSubmissionProgramsAction).toHaveBeenCalledWith('en');
	});

	test('deduplicates concurrent requests for the same language', async () => {
		let resolveRequest: ((value: { success: true; data: PublicSubmissionProgramOption[] }) => void) | undefined;
		mockGetEligiblePublicSubmissionProgramsAction.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveRequest = resolve;
				}),
		);

		const { getCachedEligiblePublicSubmissionPrograms } = await import('./eligible-programs-session-cache');

		const firstPromise = getCachedEligiblePublicSubmissionPrograms('de');
		const secondPromise = getCachedEligiblePublicSubmissionPrograms('de');

		expect(mockGetEligiblePublicSubmissionProgramsAction).toHaveBeenCalledTimes(1);

		resolveRequest?.({ success: true, data: [] });

		await expect(Promise.all([firstPromise, secondPromise])).resolves.toEqual([
			{ success: true, data: [] },
			{ success: true, data: [] },
		]);
	});

	test('retries after a failed fetch', async () => {
		mockGetEligiblePublicSubmissionProgramsAction
			.mockResolvedValueOnce({ success: false, error: 'down' })
			.mockResolvedValueOnce({ success: true, data: [] });

		const { getCachedEligiblePublicSubmissionPrograms } = await import('./eligible-programs-session-cache');

		await expect(getCachedEligiblePublicSubmissionPrograms('fr')).resolves.toEqual({
			success: false,
			error: 'down',
		});
		await expect(getCachedEligiblePublicSubmissionPrograms('fr')).resolves.toEqual({
			success: true,
			data: [],
		});
		expect(mockGetEligiblePublicSubmissionProgramsAction).toHaveBeenCalledTimes(2);
	});
});

import type { ServiceResult } from '@/lib/services/core/base.types';
import type { PublicSubmissionProgramOption } from '@/lib/services/program/program-public-submission.service';

const mockGetEligibleProgramsForPublicSubmission = jest.fn();

jest.mock('@/lib/services/services', () => ({
	services: {
		programPublicSubmission: {
			getEligibleProgramsForPublicSubmission: mockGetEligibleProgramsForPublicSubmission,
		},
	},
}));

import { getEligiblePublicSubmissionProgramsAction } from './campaign-public-actions';

describe('getEligiblePublicSubmissionProgramsAction', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('delegates to the public submission service with a valid language', async () => {
		const programsResult: ServiceResult<PublicSubmissionProgramOption[]> = { success: true, data: [] };
		mockGetEligibleProgramsForPublicSubmission.mockResolvedValue(programsResult);

		const result = await getEligiblePublicSubmissionProgramsAction('de');

		expect(mockGetEligibleProgramsForPublicSubmission).toHaveBeenCalledWith('de');
		expect(result).toEqual(programsResult);
	});

	test('treats invalid language input as the default language', async () => {
		mockGetEligibleProgramsForPublicSubmission.mockResolvedValue({ success: true, data: [] });

		await getEligiblePublicSubmissionProgramsAction('nope' as never);

		expect(mockGetEligibleProgramsForPublicSubmission).toHaveBeenCalledWith('en');
	});
});

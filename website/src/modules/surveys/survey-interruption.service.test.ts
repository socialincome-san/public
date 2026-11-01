import type { AuditContext } from '@/lib/audit/audit-types';
import type { Result } from '@/lib/result';

const mockDeleteFirebaseUserByEmailIfExists = jest.fn();
const mockFindOutstandingSurveysForRecipient = jest.fn();
const mockDeleteSurvey = jest.fn();

jest.mock('@/modules/auth/auth.service', () => ({
	deleteFirebaseUserByEmailIfExists: mockDeleteFirebaseUserByEmailIfExists,
}));
jest.mock('./survey.repository.read', () => ({
	findOutstandingSurveysForRecipient: mockFindOutstandingSurveysForRecipient,
}));
jest.mock('./survey.repository.write', () => ({
	deleteSurvey: mockDeleteSurvey,
}));

import { removeOutstandingSurveysForInterruptedRecipient } from './survey-interruption.service';

const audit: AuditContext = {
	actor: { type: 'user', id: 'user-1' },
	source: 'portal',
};

describe('removeOutstandingSurveysForInterruptedRecipient', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockFindOutstandingSurveysForRecipient.mockResolvedValue([
			{ id: 'survey-1', accessEmail: 'survey-1@si.org' },
			{ id: 'survey-2', accessEmail: 'survey-2@si.org' },
		]);
		mockDeleteFirebaseUserByEmailIfExists.mockResolvedValue({ success: true, data: true } satisfies Result<boolean>);
		mockDeleteSurvey.mockResolvedValue(undefined);
	});

	test('revokes survey login access and deletes outstanding surveys', async () => {
		const result = await removeOutstandingSurveysForInterruptedRecipient(audit, 'recipient-1');

		expect(result).toEqual({ success: true, data: undefined });
		expect(mockDeleteFirebaseUserByEmailIfExists).toHaveBeenCalledTimes(2);
		expect(mockDeleteSurvey).toHaveBeenNthCalledWith(1, audit, 'survey-1');
		expect(mockDeleteSurvey).toHaveBeenNthCalledWith(2, audit, 'survey-2');
	});

	test('keeps survey records if a login cannot be revoked', async () => {
		mockDeleteFirebaseUserByEmailIfExists.mockResolvedValueOnce({
			success: false,
			error: 'Firebase unavailable',
		} satisfies Result<boolean>);

		const result = await removeOutstandingSurveysForInterruptedRecipient(audit, 'recipient-1');

		expect(result).toEqual({
			success: false,
			error: 'Could not remove outstanding surveys for interrupted recipient',
		});
		expect(mockDeleteSurvey).not.toHaveBeenCalled();
	});
});

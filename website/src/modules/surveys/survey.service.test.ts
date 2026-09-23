import { ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import type { ServiceResult } from '@/lib/service-result';

const mockGetAccessiblePrograms = jest.fn();
const mockGetRecipientProgramAssignment = jest.fn();
const mockGetSurveyRecipients = jest.fn();
const mockCreateFirebaseSurveyUser = jest.fn();
const mockSynchronizeFirebaseSurveyUser = jest.fn();
const mockFindSurveyById = jest.fn();
const mockFindSurveyByRecipientId = jest.fn();
const mockFindSurveyByAccessEmail = jest.fn();
const mockFindSurveyByRecipientAndName = jest.fn();
const mockFindSurveySchedulesByProgramIds = jest.fn();
const mockFindCompletedSurveyImpactSource = jest.fn();
const mockCreateSurvey = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientProgramAssignment: mockGetRecipientProgramAssignment,
	getSurveyRecipients: mockGetSurveyRecipients,
}));

jest.mock('@/modules/auth/auth.service', () => ({
	createFirebaseSurveyUser: mockCreateFirebaseSurveyUser,
	synchronizeFirebaseSurveyUser: mockSynchronizeFirebaseSurveyUser,
}));

jest.mock('./survey.repository', () => ({
	findSurveyById: mockFindSurveyById,
	findSurveyByRecipientId: mockFindSurveyByRecipientId,
	findSurveyByAccessEmail: mockFindSurveyByAccessEmail,
	findSurveyByRecipientAndName: mockFindSurveyByRecipientAndName,
	findSurveySchedulesByProgramIds: mockFindSurveySchedulesByProgramIds,
	findCompletedSurveyImpactSource: mockFindCompletedSurveyImpactSource,
	createSurvey: mockCreateSurvey,
	findSurveyTableSource: jest.fn(),
	findSurveyByIdAndRecipient: jest.fn(),
	findExistingSurveyIdentities: jest.fn(),
	updateSurvey: jest.fn(),
	findSurveyImpactFilterSource: jest.fn(),
	findSurveyImpactStudySource: jest.fn(),
}));

jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2026-06-15T12:00:00.000Z'),
	nowMs: () => new Date('2026-06-15T12:00:00.000Z').getTime(),
}));

import {
	createSurvey,
	getSurvey,
	getSurveyImpactMeasurements,
	getSurveySchedulesByProgramIds,
	getSurveysByRecipientId,
} from './survey.service';

const expectSuccess = <T>(result: ServiceResult<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: ServiceResult<unknown>, error: string): void => {
	expect(result.success).toBe(false);
	if (result.success) {
		throw new Error('Expected failure');
	}
	expect(result.error).toBe(error);
};

const operatorAccess = [
	{
		programId: 'program-1',
		programName: 'Program One',
		permission: ProgramPermission.operator,
	},
];

const surveyPayload = {
	id: 'survey-1',
	name: 'Onboarding',
	questionnaire: SurveyQuestionnaire.onboarding,
	language: 'en',
	dueAt: new Date('2026-07-01T00:00:00.000Z'),
	completedAt: null,
	status: SurveyStatus.new,
	data: {},
	accessEmail: 'survey@example.org',
	accessPw: 'secret',
	recipientId: 'recipient-1',
	surveyScheduleId: null,
	createdAt: new Date('2026-06-01T00:00:00.000Z'),
	updatedAt: null,
};

describe('survey CRUD and access', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: operatorAccess });
		mockGetRecipientProgramAssignment.mockResolvedValue({
			success: true,
			data: { id: 'recipient-1', programId: 'program-1' },
		});
		mockFindSurveyByAccessEmail.mockResolvedValue(null);
		mockFindSurveyByRecipientAndName.mockResolvedValue(null);
		mockSynchronizeFirebaseSurveyUser.mockResolvedValue({ success: true, data: undefined });
		mockCreateSurvey.mockResolvedValue(surveyPayload);
	});

	test('creates a survey after validation, operator access, uniqueness, and Firebase synchronization', async () => {
		const result = await createSurvey('user-1', {
			name: ' Onboarding ',
			recipientId: 'recipient-1',
			questionnaire: SurveyQuestionnaire.onboarding,
			language: 'en',
			dueAt: new Date('2026-07-01T00:00:00.000Z'),
			status: SurveyStatus.new,
			accessEmail: 'survey@example.org',
			accessPw: 'secret',
		});

		expect(expectSuccess(result)).toEqual(surveyPayload);
		expect(mockSynchronizeFirebaseSurveyUser).toHaveBeenCalledWith({
			nextEmail: 'survey@example.org',
			nextPassword: 'secret',
		});
		expect(mockCreateSurvey).toHaveBeenCalledWith(
			expect.objectContaining({ name: 'Onboarding', recipientId: 'recipient-1', data: {} }),
		);
	});

	test('rejects invalid create input before persistence', async () => {
		const result = await createSurvey('user-1', {
			name: '',
			recipientId: 'recipient-1',
			questionnaire: SurveyQuestionnaire.onboarding,
			language: 'en',
			dueAt: new Date('2026-07-01T00:00:00.000Z'),
			status: SurveyStatus.new,
			accessEmail: 'survey@example.org',
			accessPw: 'secret',
		});

		expectFailure(result, 'Invalid input.');
		expect(mockCreateSurvey).not.toHaveBeenCalled();
	});

	test('denies reads outside the survey program', async () => {
		mockFindSurveyById.mockResolvedValue({
			...surveyPayload,
			recipient: { program: { id: 'program-2' } },
		});

		expectFailure(await getSurvey('user-1', 'survey-1'), 'Access denied');
	});
});

describe('survey schedules and recipient lookup', () => {
	test('returns ordered survey schedules from the repository', async () => {
		const schedules = [
			{
				id: 'schedule-1',
				name: 'Onboarding',
				questionnaire: SurveyQuestionnaire.onboarding,
				dueInMonthsAfterStart: 0,
				programId: 'program-1',
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
				updatedAt: null,
			},
		];
		mockFindSurveySchedulesByProgramIds.mockResolvedValue(schedules);

		expect(expectSuccess(await getSurveySchedulesByProgramIds(['program-1']))).toEqual(schedules);
		expect(mockFindSurveySchedulesByProgramIds).toHaveBeenCalledWith(['program-1']);
	});

	test('returns recipient surveys without changing their response shape', async () => {
		mockFindSurveyByRecipientId.mockResolvedValue([surveyPayload]);

		expect(expectSuccess(await getSurveysByRecipientId('recipient-1'))).toEqual([surveyPayload]);
	});
});

describe('survey impact aggregation', () => {
	test('aggregates single-choice answers and ignores unrelated questionnaire responses', async () => {
		mockFindCompletedSurveyImpactSource.mockResolvedValue([
			{
				data: { maritalStatusV1: 'married' },
				questionnaire: SurveyQuestionnaire.onboarding,
				recipientId: 'recipient-1',
				recipient: {
					programId: 'program-1',
					program: { country: { isoCode: 'SL' } },
				},
			},
			{
				data: { maritalStatusV1: 'widowed' },
				questionnaire: SurveyQuestionnaire.checkin,
				recipientId: 'recipient-2',
				recipient: {
					programId: 'program-1',
					program: { country: { isoCode: 'SL' } },
				},
			},
		]);

		const impact = expectSuccess(await getSurveyImpactMeasurements());
		const question = impact.questions.find((candidate) => candidate.name === 'maritalStatusV1');

		expect(impact).toEqual(
			expect.objectContaining({
				totalCompletedSurveys: 2,
				totalRecipients: 2,
				totalCountries: 1,
				totalPrograms: 1,
				totalQuestionnaires: 2,
			}),
		);
		expect(question?.answeredCount).toBe(2);
		expect(question?.surveyCount).toBe(2);
		expect(question?.options.find((option) => option.value === 'married')).toEqual({
			value: 'married',
			count: 1,
			percentage: 50,
		});
		expect(question?.options.find((option) => option.value === 'widowed')).toEqual({
			value: 'widowed',
			count: 1,
			percentage: 50,
		});
	});
});

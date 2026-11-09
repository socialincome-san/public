import { ProgramPermission, SurveyQuestionnaire, SurveyStatus, UserRole } from '@/generated/prisma/enums';
import type { Result } from '@/lib/result';
import type { UserSession } from '@/modules/users/user.types';

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
const mockGetRecipientFilterOption = jest.fn();
const mockFindSurveyTableSource = jest.fn();

jest.mock('@/modules/program-access/program-access.service', () => ({
	getAccessiblePrograms: mockGetAccessiblePrograms,
}));

jest.mock('@/modules/recipients/recipient.service', () => ({
	getRecipientAuditContext: (id: string, source: string) =>
		Promise.resolve({ success: true, data: { actor: { type: 'recipient', id, name: 'Ada Lovelace' }, source } }),
	getRecipientFilterOption: mockGetRecipientFilterOption,
	getRecipientProgramAssignment: mockGetRecipientProgramAssignment,
	getSurveyRecipients: mockGetSurveyRecipients,
}));

jest.mock('@/modules/auth/auth.service', () => ({
	createFirebaseSurveyUser: mockCreateFirebaseSurveyUser,
	synchronizeFirebaseSurveyUser: mockSynchronizeFirebaseSurveyUser,
}));

const mockUpdateSurvey = jest.fn();

jest.mock('./survey.repository.write', () => ({
	createSurvey: mockCreateSurvey,
	updateSurvey: mockUpdateSurvey,
}));

jest.mock('./survey.repository.read', () => ({
	findSurveyById: mockFindSurveyById,
	findSurveyByRecipientId: mockFindSurveyByRecipientId,
	findSurveyByAccessEmail: mockFindSurveyByAccessEmail,
	findSurveyByRecipientAndName: mockFindSurveyByRecipientAndName,
	findSurveySchedulesByProgramIds: mockFindSurveySchedulesByProgramIds,
	findCompletedSurveyImpactSource: mockFindCompletedSurveyImpactSource,
	findSurveyTableSource: mockFindSurveyTableSource,
	findSurveyByIdAndRecipient: jest.fn(),
	findExistingSurveyIdentities: jest.fn(),
	findSurveyImpactFilterSource: jest.fn(),
	findSurveyImpactStudySource: jest.fn(),
}));

jest.mock('@/lib/utils/now', () => ({
	now: () => new Date('2026-06-15T12:00:00.000Z'),
	nowMs: () => new Date('2026-06-15T12:00:00.000Z').getTime(),
}));

import {
	createSurvey,
	getPaginatedSurveyTableView,
	getSurvey,
	getSurveyImpactMeasurements,
	getSurveySchedulesByProgramIds,
	getSurveysByRecipientId,
	saveSurveyChanges,
} from './survey.service';

const operator: UserSession = {
	type: 'user',
	id: 'user-1',
	gender: null,
	email: null,
	firstName: 'Max',
	lastName: 'Operator',
	language: null,
	street: null,
	number: null,
	city: null,
	zip: null,
	country: null,
	role: UserRole.user,
	activeOrganization: null,
	organizations: [],
	programs: [],
	hasAnyOperatorProgramAccess: true,
};

const expectSuccess = <T>(result: Result<T>): T => {
	expect(result.success).toBe(true);
	if (!result.success) {
		throw new Error(result.error);
	}

	return result.data;
};

const expectFailure = (result: Result<unknown>, error: string): void => {
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

describe('getPaginatedSurveyTableView recipient filter', () => {
	const query = { page: 1, pageSize: 10, search: '', recipientId: 'recipient-1' };

	beforeEach(() => {
		jest.clearAllMocks();
		mockGetAccessiblePrograms.mockResolvedValue({ success: true, data: operatorAccess });
		mockFindSurveyTableSource.mockResolvedValue({ surveys: [], totalCount: 0 });
	});

	test('filters by an accessible recipient and offers it as filter option', async () => {
		mockGetRecipientFilterOption.mockResolvedValue({ success: true, data: { id: 'recipient-1', name: 'Aminata Kamara' } });

		const data = expectSuccess(await getPaginatedSurveyTableView('user-1', query));

		expect(mockGetRecipientFilterOption).toHaveBeenCalledWith('recipient-1', ['program-1']);
		expect(mockFindSurveyTableSource).toHaveBeenCalledWith(expect.objectContaining({ recipientId: 'recipient-1' }));
		expect(data.recipientFilterOptions).toEqual([{ id: 'recipient-1', name: 'Aminata Kamara' }]);
	});

	test('ignores a recipient outside the operated programs', async () => {
		mockGetRecipientFilterOption.mockResolvedValue({ success: true, data: null });

		const data = expectSuccess(await getPaginatedSurveyTableView('user-1', query));

		expect(mockFindSurveyTableSource).toHaveBeenCalledWith(expect.objectContaining({ recipientId: undefined }));
		expect(data.recipientFilterOptions).toEqual([]);
	});

	test('returns no surveys without operator access', async () => {
		mockGetAccessiblePrograms.mockResolvedValue({
			success: true,
			data: [{ programId: 'program-1', programName: 'Program One', permission: ProgramPermission.owner }],
		});

		const data = expectSuccess(await getPaginatedSurveyTableView('user-1', query));

		expect(data.tableRows).toEqual([]);
		expect(mockGetRecipientFilterOption).not.toHaveBeenCalled();
		expect(mockFindSurveyTableSource).not.toHaveBeenCalled();
	});
});

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
		const result = await createSurvey(operator, {
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
			{ actor: { type: 'user', id: 'user-1', name: 'Max Operator' }, source: 'portal' },
			expect.objectContaining({ name: 'Onboarding', recipientId: 'recipient-1', data: {} }),
		);
	});

	test('rejects invalid create input before persistence', async () => {
		const result = await createSurvey(operator, {
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

describe('saveSurveyChanges', () => {
	test('attributes answers to the surveyed recipient', async () => {
		mockFindSurveyById.mockResolvedValue({ id: 'survey-1', recipientId: 'recipient-1' });
		mockUpdateSurvey.mockResolvedValue(surveyPayload);

		await saveSurveyChanges('survey-1', { data: { q1: 'yes' }, status: SurveyStatus.in_progress });

		expect(mockUpdateSurvey).toHaveBeenCalledWith(
			{ actor: { type: 'recipient', id: 'recipient-1', name: 'Ada Lovelace' }, source: 'website' },
			'survey-1',
			expect.objectContaining({ status: SurveyStatus.in_progress }),
		);
	});
});

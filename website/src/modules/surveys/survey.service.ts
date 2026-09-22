import { Gender, ProgramPermission, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/enums';
import { RECIPIENT_AGE_GROUP_BOUNDS, RECIPIENT_AGE_GROUPS } from '@/lib/constants/recipient-age-groups';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { QUESTIONS } from '@/lib/types/question';
import { now, nowMs } from '@/lib/utils/now';
import { TRAILING_SLASHES_REGEX } from '@/lib/utils/regex';
import { createFirebaseSurveyUser, synchronizeFirebaseSurveyUser } from '@/modules/auth/auth.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import { getRecipientProgramAssignment, getSurveyRecipients } from '@/modules/recipients/recipient.service';
import { addMonths, differenceInDays, endOfMonth, max, min, startOfMonth, subMonths } from 'date-fns';
import crypto from 'node:crypto';
import { hasSurveyOperatorAccess, hasSurveyProgramAccess } from './survey.permissions';
import * as surveyRepository from './survey.repository';
import {
	surveyCreateSchema,
	surveyResponseUpdateSchema,
	surveyTableQuerySchema,
	surveyUpdateSchema,
	type SurveyCreateInput,
	type SurveyUpdateInput,
} from './survey.schemas';
import type {
	AnswerRecord,
	QuestionDefinition,
	SurveyAnswerRecord,
	SurveyCreateData,
	SurveyGenerationPreviewResult,
	SurveyGenerationResult,
	SurveyImpactData,
	SurveyImpactFilterOptions,
	SurveyImpactFilters,
	SurveyImpactQuery,
	SurveyImpactQuestion,
	SurveyImpactRecipientAgeGroup,
	SurveyImpactStudyDetailItem,
	SurveyImpactStudyDetails,
	SurveyJsonValue,
	SurveyPaginatedTableView,
	SurveyPayload,
	SurveyResponseUpdateInput,
	SurveySchedulePayload,
	SurveyTableQuery,
	SurveyTableViewRow,
	SurveyUpdateData,
	SurveyWithRecipient,
} from './survey.types';

export const getPaginatedSurveyTableView = async (
	userId: string,
	query: SurveyTableQuery,
): Promise<ServiceResult<SurveyPaginatedTableView>> => {
	const queryResult = surveyTableQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid survey table query');
	}

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		return getPaginatedSurveyTableViewForPrograms(
			accessResult.data.filter((program) => program.permission === ProgramPermission.operator),
			queryResult.data,
		);
	} catch (error) {
		console.error('Could not fetch surveys', { userId, error });

		return resultFail('Could not fetch surveys');
	}
};

export const getPaginatedUpcomingSurveyTableView = async (
	userId: string,
	query: SurveyTableQuery,
): Promise<ServiceResult<SurveyPaginatedTableView>> => {
	const queryResult = surveyTableQuerySchema.safeParse(query);
	if (!queryResult.success) {
		return resultFail('Invalid survey table query');
	}

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const accessiblePrograms = accessResult.data.filter((program) => program.permission === ProgramPermission.operator);
		const currentDate = now();

		return getPaginatedSurveyTableViewForPrograms(accessiblePrograms, queryResult.data, {
			from: startOfMonth(subMonths(currentDate, 1)),
			to: endOfMonth(currentDate),
		});
	} catch (error) {
		console.error('Could not fetch upcoming surveys', { userId, error });

		return resultFail('Could not fetch upcoming surveys');
	}
};

export const getSurvey = async (userId: string, surveyId: string): Promise<ServiceResult<SurveyPayload>> => {
	try {
		const survey = await surveyRepository.findSurveyById(surveyId);
		if (!survey) {
			return resultFail('Survey not found');
		}

		const programId = survey.recipient.program?.id;
		if (!programId) {
			return resultFail('Access denied');
		}

		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!hasSurveyProgramAccess(accessResult.data, programId)) {
			return resultFail('Access denied');
		}

		return resultOk(toSurveyPayload(survey));
	} catch (error) {
		console.error('Failed to get survey', { userId, surveyId, error });

		return resultFail('Failed to get survey');
	}
};

export const getSurveysByRecipientId = async (recipientId: string): Promise<ServiceResult<SurveyPayload[]>> => {
	try {
		const surveys = await surveyRepository.findSurveyByRecipientId(recipientId);

		return resultOk(surveys.map(toSurveyPayload));
	} catch (error) {
		console.error('Could not fetch recipient surveys', { recipientId, error });

		return resultFail('Could not fetch surveys');
	}
};

export const getSurveyByAccessEmail = async (email: string): Promise<ServiceResult<SurveyPayload>> => {
	try {
		const survey = await surveyRepository.findSurveyByAccessEmail(email);
		if (!survey) {
			return resultFail('Survey not found');
		}

		return resultOk(toSurveyPayload(survey));
	} catch (error) {
		console.error('Could not fetch survey by access email', { email, error });

		return resultFail('Could not fetch survey');
	}
};

export const getSurveyByIdAndRecipient = async (
	surveyId: string,
	recipientId: string,
): Promise<ServiceResult<SurveyWithRecipient>> => {
	try {
		const survey = await surveyRepository.findSurveyByIdAndRecipient(surveyId, recipientId);
		if (!survey) {
			return resultFail('Survey not found');
		}

		return resultOk({
			id: survey.id,
			name: survey.name,
			questionnaire: survey.questionnaire,
			status: survey.status,
			data: toSurveyJsonValue(survey.data),
			language: survey.language,
			nameOfRecipient: `${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
		});
	} catch (error) {
		console.error('Could not fetch public survey', { surveyId, recipientId, error });

		return resultFail('Could not fetch survey');
	}
};

export const getSurveySchedulesByProgramIds = async (
	programIds: string[],
): Promise<ServiceResult<SurveySchedulePayload[]>> => {
	try {
		return resultOk(await surveyRepository.findSurveySchedulesByProgramIds(programIds));
	} catch (error) {
		console.error('Failed to get survey schedules for programs', { programIds, error });

		return resultFail('Failed to get survey schedules for programs');
	}
};

export const previewSurveyGeneration = async (userId: string): Promise<ServiceResult<SurveyGenerationPreviewResult>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		const programIds = accessResult.data
			.filter((program) => program.permission === ProgramPermission.operator)
			.map((program) => program.programId);
		if (programIds.length === 0) {
			return resultOk({ surveys: [] });
		}

		const recipientsResult = await getSurveyRecipients(programIds);
		if (!recipientsResult.success) {
			return resultFail(recipientsResult.error);
		}
		const schedulesResult = await getSurveySchedulesByProgramIds(programIds);
		if (!schedulesResult.success) {
			return resultFail(schedulesResult.error);
		}

		const recipients = recipientsResult.data;
		const existingSurveys = await surveyRepository.findExistingSurveyIdentities(recipients.map((recipient) => recipient.id));
		const generatedEmails = new Set(existingSurveys.map((survey) => survey.accessEmail));
		const surveys: SurveyCreateData[] = [];

		for (const recipient of recipients) {
			if (!recipient.startDate) {
				continue;
			}

			for (const schedule of schedulesResult.data.filter((candidate) => candidate.programId === recipient.programId)) {
				const hasExistingSurvey = existingSurveys.some(
					(existing) => existing.recipientId === recipient.id && existing.name === schedule.name,
				);
				if (hasExistingSurvey) {
					continue;
				}

				const dueAt = addMonths(recipient.startDate, schedule.dueInMonthsAfterStart);
				let accessEmail = createSurveyAccessEmail();
				while (generatedEmails.has(accessEmail)) {
					accessEmail = createSurveyAccessEmail();
				}
				generatedEmails.add(accessEmail);

				surveys.push({
					name: schedule.name,
					recipientId: recipient.id,
					questionnaire: schedule.questionnaire,
					language: 'en',
					dueAt,
					status: dueAt < now() ? SurveyStatus.missed : SurveyStatus.new,
					data: {},
					accessEmail,
					accessPw: crypto.randomBytes(16).toString('base64url'),
					surveyScheduleId: schedule.id,
				});
			}
		}

		return resultOk({ surveys });
	} catch (error) {
		console.error('Failed to preview survey generation', { userId, error });

		return resultFail('Failed to preview survey generation');
	}
};

export const createSurvey = async (userId: string, input: SurveyCreateInput): Promise<ServiceResult<SurveyPayload>> => {
	const inputResult = surveyCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	try {
		const recipientResult = await getRecipientProgramAssignment(inputResult.data.recipientId);
		if (!recipientResult.success) {
			return resultFail(recipientResult.error);
		}
		if (!recipientResult.data) {
			return resultFail('Recipient not found');
		}
		if (!recipientResult.data.programId) {
			return resultFail('Recipient is not assigned to a program');
		}

		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!hasSurveyOperatorAccess(accessResult.data, recipientResult.data.programId)) {
			return resultFail('Access denied');
		}

		const uniquenessResult = await validateSurveyUniqueness(inputResult.data);
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const firebaseResult = await synchronizeFirebaseSurveyUser({
			nextEmail: inputResult.data.accessEmail,
			nextPassword: inputResult.data.accessPw,
		});
		if (!firebaseResult.success) {
			console.error('Could not synchronize survey Firebase user', { error: firebaseResult.error });

			return resultFail('Could not synchronize survey authentication user');
		}

		const survey = await surveyRepository.createSurvey({
			...inputResult.data,
			data: {},
		});

		return resultOk(toSurveyPayload(survey));
	} catch (error) {
		console.error('Failed to create survey', { userId, error });

		return resultFail('Failed to create survey. Please try again later.');
	}
};

export const updateSurvey = async (userId: string, input: SurveyUpdateInput): Promise<ServiceResult<SurveyPayload>> => {
	const inputResult = surveyUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	try {
		const existing = await surveyRepository.findSurveyById(inputResult.data.id);
		if (!existing) {
			return resultFail('Survey not found');
		}
		const existingProgramId = existing.recipient.program?.id;
		if (!existingProgramId) {
			return resultFail('Recipient is not assigned to a program');
		}

		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!hasSurveyOperatorAccess(accessResult.data, existingProgramId)) {
			return resultFail('Access denied');
		}

		const targetRecipientResult = await getRecipientProgramAssignment(inputResult.data.recipientId);
		if (!targetRecipientResult.success) {
			return resultFail(targetRecipientResult.error);
		}
		const targetRecipient = targetRecipientResult.data;
		if (!targetRecipient) {
			return resultFail('Recipient not found');
		}
		if (!targetRecipient.programId) {
			return resultFail('Recipient is not assigned to a program');
		}
		if (!hasSurveyOperatorAccess(accessResult.data, targetRecipient.programId)) {
			return resultFail('Access denied');
		}

		const uniquenessResult = await validateSurveyUniqueness(inputResult.data, {
			id: existing.id,
			recipientId: existing.recipientId,
			name: existing.name,
			accessEmail: existing.accessEmail,
		});
		if (!uniquenessResult.success) {
			return resultFail(uniquenessResult.error);
		}

		const emailChanged = inputResult.data.accessEmail !== existing.accessEmail;
		if (emailChanged && !inputResult.data.accessPw) {
			return resultFail('Access password is required when changing access email.');
		}

		const updateData: SurveyUpdateData = {
			name: inputResult.data.name,
			questionnaire: inputResult.data.questionnaire,
			language: inputResult.data.language,
			dueAt: inputResult.data.dueAt,
			status: inputResult.data.status,
			accessEmail: inputResult.data.accessEmail,
			...(inputResult.data.recipientId !== existing.recipientId ? { recipientId: inputResult.data.recipientId } : {}),
		};
		if (inputResult.data.accessPw) {
			const firebaseResult = await synchronizeFirebaseSurveyUser({
				previousEmail: existing.accessEmail,
				nextEmail: inputResult.data.accessEmail,
				nextPassword: inputResult.data.accessPw,
			});
			if (!firebaseResult.success) {
				console.error('Could not synchronize survey Firebase user', { error: firebaseResult.error });

				return resultFail('Could not synchronize survey authentication user');
			}
			updateData.accessPw = inputResult.data.accessPw;
		}

		return resultOk(toSurveyPayload(await surveyRepository.updateSurvey(existing.id, updateData)));
	} catch (error) {
		console.error('Failed to update survey', { userId, surveyId: input.id, error });

		return resultFail('Failed to update survey. Please try again later.');
	}
};

export const generateSurveys = async (userId: string): Promise<ServiceResult<SurveyGenerationResult>> => {
	try {
		const previewResult = await previewSurveyGeneration(userId);
		if (!previewResult.success) {
			return resultFail(previewResult.error);
		}
		if (previewResult.data.surveys.length === 0) {
			return resultOk({ surveysCreated: 0, message: 'No surveys to create' });
		}

		let surveysCreated = 0;
		for (const surveyInput of previewResult.data.surveys) {
			const firebaseResult = await createFirebaseSurveyUser(surveyInput.accessEmail, surveyInput.accessPw);
			if (!firebaseResult.success) {
				console.error('Could not create Firebase user for generated survey', { error: firebaseResult.error });

				return resultFail('Could not create survey authentication user');
			}
			await surveyRepository.createSurvey(surveyInput);
			surveysCreated += 1;
		}

		return resultOk({
			surveysCreated,
			message: `Successfully created ${surveysCreated} surveys`,
		});
	} catch (error) {
		console.error('Failed to generate surveys', { userId, error });

		return resultFail('Failed to generate surveys');
	}
};

export const saveSurveyChanges = async (
	surveyId: string,
	input: SurveyResponseUpdateInput,
): Promise<ServiceResult<SurveyPayload>> => {
	const inputResult = surveyResponseUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	try {
		const existing = await surveyRepository.findSurveyById(surveyId);
		if (!existing) {
			return resultFail('Survey not found');
		}

		return resultOk(toSurveyPayload(await surveyRepository.updateSurvey(surveyId, inputResult.data)));
	} catch (error) {
		console.error('Failed to save survey changes', { surveyId, error });

		return resultFail('Failed to update survey');
	}
};

export const getSurveyImpactMeasurements = async (
	filters?: SurveyImpactFilters,
): Promise<ServiceResult<SurveyImpactData>> => {
	try {
		const surveys = await surveyRepository.findCompletedSurveyImpactSource(toImpactQuery(filters));
		const surveyAnswers: SurveyAnswerRecord[] = [];
		for (const survey of surveys) {
			const answers = toAnswerRecord(survey.data);
			if (answers) {
				surveyAnswers.push({ questionnaire: survey.questionnaire, answers });
			}
		}

		const questions = QUESTIONS.map((question) => {
			const relevantQuestionnaires = getQuestionQuestionnaires(question.name);
			const relevantResponses = surveyAnswers
				.filter((answer) => relevantQuestionnaires.includes(answer.questionnaire))
				.map((answer) => answer.answers);

			return aggregateQuestion(question, relevantResponses, relevantQuestionnaires);
		});
		const countries = surveys
			.map((survey) => survey.recipient.program?.country?.isoCode)
			.filter((country) => country !== null && country !== undefined);

		return resultOk({
			totalCompletedSurveys: surveys.length,
			totalRecipients: new Set(surveys.map((survey) => survey.recipientId)).size,
			totalCountries: new Set(countries).size,
			totalPrograms: new Set(
				surveys
					.map((survey) => survey.recipient.programId)
					.filter((programId) => programId !== null && programId !== undefined),
			).size,
			totalQuestionnaires: new Set(surveys.map((survey) => survey.questionnaire)).size,
			questions,
		});
	} catch (error) {
		console.error('Could not load survey impact measurements', { filters, error });

		return resultFail('Could not load survey impact measurements');
	}
};

export const getSurveyImpactFilterOptions = async (): Promise<ServiceResult<SurveyImpactFilterOptions>> => {
	try {
		const surveys = await surveyRepository.findSurveyImpactFilterSource();
		const countrySet = new Set<string>();
		const focusMap = new Map<string, string>();
		const programMap = new Map<string, string>();
		const questionnaireSet = new Set<string>();

		for (const survey of surveys) {
			questionnaireSet.add(survey.questionnaire);
			for (const { focus } of survey.recipient.localPartner.focuses) {
				focusMap.set(focus.id, focus.slug);
			}
			const program = survey.recipient.program;
			if (program) {
				if (program.country?.isoCode) {
					countrySet.add(program.country.isoCode);
				}
				programMap.set(program.id, program.name);
			}
		}

		return resultOk({
			countries: toSortedFilterOptions(countrySet),
			focuses: toSortedMapFilterOptions(focusMap),
			programs: toSortedMapFilterOptions(programMap),
			questionnaires: toSortedFilterOptions(questionnaireSet),
		});
	} catch (error) {
		console.error('Could not load survey impact filter options', { error });

		return resultFail('Could not load survey impact filter options');
	}
};

export const getSurveyImpactStudyDetails = async (
	filters?: SurveyImpactFilters,
): Promise<ServiceResult<SurveyImpactStudyDetails>> => {
	try {
		const surveys = await surveyRepository.findSurveyImpactStudySource(toImpactQuery(filters));
		const uniqueRecipients = new Map<string, (typeof surveys)[number]['recipient']>();
		for (const survey of surveys) {
			if (!uniqueRecipients.has(survey.recipientId)) {
				uniqueRecipients.set(survey.recipientId, survey.recipient);
			}
		}

		const countryCounts = new Map<string, number>();
		const genderCounts = new Map<string, number>([
			[Gender.male, 0],
			[Gender.female, 0],
		]);
		const ageCounts = new Map<string, number>(RECIPIENT_AGE_GROUPS.map((ageGroup) => [ageGroup, 0]));
		for (const recipient of uniqueRecipients.values()) {
			const isoCode = recipient.program?.country?.isoCode;
			if (isoCode) {
				countryCounts.set(isoCode, (countryCounts.get(isoCode) ?? 0) + 1);
			}
			if (recipient.contact?.gender && genderCounts.has(recipient.contact.gender)) {
				genderCounts.set(recipient.contact.gender, (genderCounts.get(recipient.contact.gender) ?? 0) + 1);
			}
			const ageGroup = getAgeGroupForDateOfBirth(recipient.contact?.dateOfBirth ?? null);
			if (ageGroup) {
				ageCounts.set(ageGroup, (ageCounts.get(ageGroup) ?? 0) + 1);
			}
		}

		const completedAtDates = surveys
			.map((survey) => survey.completedAt)
			.filter((completedAt) => completedAt instanceof Date);
		const timeFrameStart = completedAtDates.length > 0 ? min(completedAtDates) : null;
		const timeFrameEnd = completedAtDates.length > 0 ? max(completedAtDates) : null;
		const lastCompletedAt = surveys.find((survey) => survey.completedAt !== null)?.completedAt ?? null;

		return resultOk({
			totalCompletedSurveys: surveys.length,
			totalRecipients: uniqueRecipients.size,
			lastResponseDaysAgo: lastCompletedAt ? Math.max(0, differenceInDays(nowMs(), lastCompletedAt)) : null,
			timeFrameStart,
			timeFrameEnd,
			timeFrameDays: timeFrameStart && timeFrameEnd ? Math.max(0, differenceInDays(timeFrameEnd, timeFrameStart)) : null,
			countryBreakdown: toBreakdownItems(countryCounts, uniqueRecipients.size),
			genderBreakdown: toBreakdownItems(genderCounts, uniqueRecipients.size, false),
			ageBreakdown: toBreakdownItems(ageCounts, uniqueRecipients.size, false),
		});
	} catch (error) {
		console.error('Could not load survey impact study details', { filters, error });

		return resultFail('Could not load survey impact study details');
	}
};

const getPaginatedSurveyTableViewForPrograms = async (
	accessiblePrograms: { programId: string; programName: string }[],
	query: SurveyTableQuery,
	upcomingRange?: { from: Date; to: Date },
): Promise<ServiceResult<SurveyPaginatedTableView>> => {
	const programFilterOptions = Array.from(
		new Map(
			accessiblePrograms.map((program) => [program.programId, { id: program.programId, name: program.programName }]),
		).values(),
	);
	if (accessiblePrograms.length === 0) {
		return resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
	}

	const programIds = accessiblePrograms.map((program) => program.programId);
	const selectedProgramId = query.programId?.trim();
	if (selectedProgramId && !programIds.includes(selectedProgramId)) {
		return resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
	}

	const source = await surveyRepository.findSurveyTableSource({ programIds, query, upcomingRange });
	const tableRows: SurveyTableViewRow[] = [];
	for (const survey of source.surveys) {
		const program = survey.recipient.program;
		if (!program) {
			continue;
		}
		tableRows.push({
			id: survey.id,
			name: survey.name,
			recipientName: `${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
			programId: program.id,
			programName: program.name,
			questionnaire: survey.questionnaire,
			status: survey.status,
			language: survey.language,
			dueAt: survey.dueAt,
			completedAt: survey.completedAt,
			createdAt: survey.createdAt,
			surveyUrl: buildSurveyUrl({
				surveyId: survey.id,
				recipientId: survey.recipient.id,
				accessEmail: survey.accessEmail,
				accessPw: survey.accessPw,
			}),
		});
	}

	return resultOk({ tableRows, totalCount: source.totalCount, programFilterOptions });
};

const validateSurveyUniqueness = async (
	input: SurveyCreateInput | SurveyUpdateInput,
	existing?: { id: string; recipientId: string; name: string; accessEmail: string },
): Promise<ServiceResult<void>> => {
	if (input.accessEmail !== existing?.accessEmail) {
		const emailConflict = await surveyRepository.findSurveyByAccessEmail(input.accessEmail);
		if (emailConflict && emailConflict.id !== existing?.id) {
			return resultFail('A survey with this access email already exists.');
		}
	}
	if (input.recipientId !== existing?.recipientId || input.name !== existing?.name) {
		const nameConflict = await surveyRepository.findSurveyByRecipientAndName(input.recipientId, input.name);
		if (nameConflict && nameConflict.id !== existing?.id) {
			return resultFail('A survey with this name already exists for the selected recipient.');
		}
	}

	return resultOk(undefined);
};

const toSurveyPayload = (survey: {
	id: string;
	name: string;
	questionnaire: SurveyPayload['questionnaire'];
	language: string;
	dueAt: Date;
	completedAt: Date | null;
	status: SurveyPayload['status'];
	data: unknown;
	accessEmail: string;
	accessPw: string;
	recipientId: string;
	surveyScheduleId: string | null;
	createdAt: Date;
	updatedAt: Date | null;
}): SurveyPayload => ({
	id: survey.id,
	name: survey.name,
	questionnaire: survey.questionnaire,
	language: survey.language,
	dueAt: survey.dueAt,
	completedAt: survey.completedAt,
	status: survey.status,
	data: toSurveyJsonValue(survey.data),
	accessEmail: survey.accessEmail,
	accessPw: survey.accessPw,
	recipientId: survey.recipientId,
	surveyScheduleId: survey.surveyScheduleId,
	createdAt: survey.createdAt,
	updatedAt: survey.updatedAt,
});

const buildSurveyUrl = ({
	surveyId,
	recipientId,
	accessEmail,
	accessPw,
}: {
	surveyId: string;
	recipientId: string;
	accessEmail: string;
	accessPw: string;
}): string => {
	const base = (process.env.BASE_URL ?? '').replace(TRAILING_SLASHES_REGEX, '');
	const url = new URL([base, 'survey', recipientId, surveyId].join('/'));
	url.search = new URLSearchParams({ email: accessEmail, pw: accessPw }).toString();

	return url.toString();
};

const createSurveyAccessEmail = (): string => `${crypto.randomBytes(16).toString('base64url').toLowerCase()}@si.org`;

const toImpactQuery = (filters?: SurveyImpactFilters): SurveyImpactQuery => {
	const { recipientAgeGroups, ...query } = filters ?? {};
	if (!recipientAgeGroups || recipientAgeGroups.length === 0) {
		return query;
	}

	const currentDate = now();
	const recipientBirthDateRanges = RECIPIENT_AGE_GROUPS.filter((group) => recipientAgeGroups.includes(group)).map(
		(group) => {
			const bounds = RECIPIENT_AGE_GROUP_BOUNDS[group];

			return {
				...(bounds.maxAge !== undefined ? { gte: shiftYears(currentDate, -bounds.maxAge) } : {}),
				...(bounds.minAge !== undefined ? { lte: shiftYears(currentDate, -bounds.minAge) } : {}),
			};
		},
	);

	return { ...query, recipientBirthDateRanges };
};

const shiftYears = (date: Date, years: number): Date => {
	const shifted = new Date(date.getTime());
	shifted.setFullYear(shifted.getFullYear() + years);

	return shifted;
};

const getAgeGroupForDateOfBirth = (dateOfBirth: Date | null): SurveyImpactRecipientAgeGroup | null => {
	if (!dateOfBirth) {
		return null;
	}
	const today = now();
	const age = today.getFullYear() - dateOfBirth.getFullYear();
	const hasHadBirthday =
		today.getMonth() > dateOfBirth.getMonth() ||
		(today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
	const normalizedAge = hasHadBirthday ? age : age - 1;

	for (const group of RECIPIENT_AGE_GROUPS) {
		const bounds = RECIPIENT_AGE_GROUP_BOUNDS[group];
		if (
			normalizedAge >= (bounds.minAge ?? Number.NEGATIVE_INFINITY) &&
			normalizedAge <= (bounds.maxAge ?? Number.POSITIVE_INFINITY)
		) {
			return group;
		}
	}

	return null;
};

const isSurveyJsonValue = (value: unknown): value is SurveyJsonValue => {
	if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
		return true;
	}
	if (Array.isArray(value)) {
		return value.every(isSurveyJsonValue);
	}
	if (typeof value !== 'object') {
		return false;
	}

	return Object.values(value).every(isSurveyJsonValue);
};

const toSurveyJsonValue = (value: unknown): SurveyJsonValue => (isSurveyJsonValue(value) ? value : null);

const toAnswerRecord = (value: unknown): AnswerRecord | null => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		return null;
	}
	const answerRecord: AnswerRecord = {};
	for (const [key, answer] of Object.entries(value)) {
		if (isSurveyJsonValue(answer)) {
			answerRecord[key] = answer;
		}
	}

	return answerRecord;
};

const getAnswerValue = (response: AnswerRecord, questionName: string): SurveyJsonValue | undefined => {
	const legacyQuestionName = questionName.replace(/V\d+$/, '');
	for (const key of legacyQuestionName === questionName ? [questionName] : [questionName, legacyQuestionName]) {
		if (key in response) {
			return response[key];
		}
	}

	return undefined;
};

const aggregateQuestion = (
	question: QuestionDefinition,
	responses: AnswerRecord[],
	questionnaires: SurveyQuestionnaire[],
): SurveyImpactQuestion => {
	const questionType = String(question.type);
	if (questionType === 'comment') {
		const answeredCount = responses.filter((response) => {
			const answer = getAnswerValue(response, question.name);

			return typeof answer === 'string' && answer.trim().length > 0;
		}).length;

		return toImpactQuestion(question, questionnaires, responses.length, answeredCount, []);
	}

	const counts = new Map<string, number>(question.choices.map((choice) => [String(choice), 0]));
	const hasPredefinedChoices = question.choices.length > 0;
	let answeredCount = 0;
	if (questionType === 'checkbox' || questionType === 'ranking') {
		for (const response of responses) {
			const answer = getAnswerValue(response, question.name);
			if (!Array.isArray(answer)) {
				continue;
			}
			const selectedValues = new Set<string>();
			for (const value of answer) {
				if (typeof value === 'string' && (!hasPredefinedChoices || counts.has(value))) {
					selectedValues.add(value);
				}
			}
			if (selectedValues.size === 0) {
				continue;
			}
			answeredCount += 1;
			for (const value of selectedValues) {
				counts.set(value, (counts.get(value) ?? 0) + 1);
			}
		}
	} else {
		for (const response of responses) {
			const answer = getAnswerValue(response, question.name);
			if ((typeof answer !== 'string' && typeof answer !== 'boolean') || !counts.has(String(answer))) {
				continue;
			}
			answeredCount += 1;
			counts.set(String(answer), (counts.get(String(answer)) ?? 0) + 1);
		}
	}

	const values = hasPredefinedChoices ? question.choices.map(String) : Array.from(counts.keys());
	const options = values.map((value) => ({
		value,
		count: counts.get(value) ?? 0,
		percentage: answeredCount > 0 ? ((counts.get(value) ?? 0) / answeredCount) * 100 : 0,
	}));

	return toImpactQuestion(question, questionnaires, responses.length, answeredCount, options);
};

const toImpactQuestion = (
	question: QuestionDefinition,
	questionnaires: SurveyQuestionnaire[],
	surveyCount: number,
	answeredCount: number,
	options: SurveyImpactQuestion['options'],
): SurveyImpactQuestion => ({
	name: question.name,
	inputType: String(question.type),
	translationKey: question.translationKey,
	descriptionTranslationKey: question.descriptionTranslationKey,
	choicesTranslationKey: question.choicesTranslationKey,
	questionnaires,
	answeredCount,
	surveyCount,
	options,
});

const getQuestionQuestionnaires = (questionName: string): SurveyQuestionnaire[] => {
	if (onboardingOnlyQuestionNames.has(questionName)) {
		return [SurveyQuestionnaire.onboarding];
	}
	if (checkinOnlyQuestionNames.has(questionName)) {
		return [SurveyQuestionnaire.checkin];
	}
	if (activeProgramQuestionNames.has(questionName)) {
		return [SurveyQuestionnaire.onboarding, SurveyQuestionnaire.checkin];
	}
	if (offboardingOnlyQuestionNames.has(questionName)) {
		return [SurveyQuestionnaire.offboarding];
	}
	if (offboardingSharedQuestionNames.has(questionName)) {
		return [SurveyQuestionnaire.offboarding, SurveyQuestionnaire.offboarded_checkin];
	}

	return defaultQuestionnaires;
};

const toSortedFilterOptions = (values: Set<string>): { value: string; label: string }[] =>
	Array.from(values)
		.sort((left, right) => left.localeCompare(right))
		.map((value) => ({ value, label: value }));

const toSortedMapFilterOptions = (values: Map<string, string>): { value: string; label: string }[] =>
	Array.from(values.entries())
		.sort((left, right) => left[1].localeCompare(right[1]))
		.map(([value, label]) => ({ value, label }));

const toBreakdownItems = (counts: Map<string, number>, total: number, sortByCount = true): SurveyImpactStudyDetailItem[] => {
	const items = Array.from(counts.entries()).map(([value, count]) => ({
		value,
		count,
		percentage: total > 0 ? (count / total) * 100 : 0,
	}));

	return sortByCount ? items.sort((left, right) => right.count - left.count) : items;
};

const defaultQuestionnaires = [
	SurveyQuestionnaire.onboarding,
	SurveyQuestionnaire.checkin,
	SurveyQuestionnaire.offboarding,
	SurveyQuestionnaire.offboarded_checkin,
];

const onboardingOnlyQuestionNames = new Set(['plannedAchievementV1']);
const checkinOnlyQuestionNames = new Set(['spendingV1', 'spendingRankedV1', 'plannedAchievementRemainingV1']);
const activeProgramQuestionNames = new Set([
	'debtPersonalV1',
	'debtPersonalRepayV1',
	'debtHouseholdV1',
	'debtHouseholdWhoRepaysV1',
	'otherSupportV1',
]);
const offboardingOnlyQuestionNames = new Set([
	'impactLifeGeneralV1',
	'achievementsAchievedV1',
	'achievementsNotAchievedCommentV1',
	'happierV1',
	'happierCommentV1',
	'notHappierCommentV1',
]);
const offboardingSharedQuestionNames = new Set(['impactFinancialIndependenceV1', 'longEnough']);

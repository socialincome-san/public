import { CountryCode, Gender, Prisma, PrismaClient, SurveyQuestionnaire, SurveyStatus } from '@/generated/prisma/client';
import { RECIPIENT_AGE_GROUP_BOUNDS, RECIPIENT_AGE_GROUPS } from '@/lib/constants/recipient-age-groups';
import { QUESTIONS } from '@/lib/types/question';
import { logger } from '@/lib/utils/logger';
import { now, nowMs } from '@/lib/utils/now';
import { differenceInDays, max, min } from 'date-fns';
import { getQuestionnaire } from '../../../app/[lang]/[region]/survey/[recipient]/[survey]/questionnaires';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import {
	AnswerRecord,
	QuestionDefinition,
	SurveyAnswerRecord,
	SurveyImpactData,
	SurveyImpactFilterOptions,
	SurveyImpactFilters,
	SurveyImpactQuestion,
	SurveyImpactRecipientAgeGroup,
	SurveyImpactStudyDetailItem,
	SurveyImpactStudyDetails,
} from './survey-impact.types';

const defaultQuestionnaires: SurveyQuestionnaire[] = [
	SurveyQuestionnaire.onboarding,
	SurveyQuestionnaire.checkin,
	SurveyQuestionnaire.offboarding,
	SurveyQuestionnaire.offboarded_checkin,
];

export class SurveyImpactService extends BaseService {
	private static questionQuestionnairesCache: Record<string, SurveyQuestionnaire[]> | null = null;

	constructor(db: PrismaClient, loggerInstance = logger) {
		super(db, loggerInstance);
	}

	private getAnswerValue(response: AnswerRecord, questionName: string): Prisma.JsonValue | undefined {
		const legacyQuestionName = questionName.replace(/V\d+$/, '');
		const candidateKeys = legacyQuestionName !== questionName ? [questionName, legacyQuestionName] : [questionName];

		for (const key of candidateKeys) {
			if (key in response) {
				return response[key];
			}
		}

		return undefined;
	}

	private isQuestionDefinition(value: unknown): value is QuestionDefinition {
		if (!value || typeof value !== 'object') {
			return false;
		}

		const candidate = value as Partial<QuestionDefinition>;

		return (
			typeof candidate.name === 'string' &&
			typeof candidate.translationKey === 'string' &&
			Array.isArray(candidate.choices) &&
			candidate.choices.every((choice) => typeof choice === 'string' || typeof choice === 'boolean') &&
			candidate.type !== undefined
		);
	}

	private isJsonObject(value: Prisma.JsonValue): value is Prisma.JsonObject {
		return typeof value === 'object' && value !== null && !Array.isArray(value);
	}

	private isNonEmptyString(value: unknown): value is string {
		return typeof value === 'string' && value.trim().length > 0;
	}

	private getQuestionCatalog(): QuestionDefinition[] {
		return QUESTIONS.filter((value) => this.isQuestionDefinition(value));
	}

	private identityTranslate<T = string>(this: void, key: string): T {
		return key as T;
	}

	private isSupportedQuestionElement(element: unknown): element is { type: string; name: string } {
		if (!element || typeof element !== 'object') {
			return false;
		}

		const candidate = element as { type?: unknown; name?: unknown };
		if (typeof candidate.type !== 'string' || typeof candidate.name !== 'string') {
			return false;
		}

		return ['radiogroup', 'checkbox', 'comment', 'ranking'].includes(candidate.type);
	}

	private getQuestionQuestionnairesMap(): Record<string, SurveyQuestionnaire[]> {
		if (SurveyImpactService.questionQuestionnairesCache) {
			return SurveyImpactService.questionQuestionnairesCache;
		}

		const questionMap = new Map<string, Set<SurveyQuestionnaire>>();
		const questionnaires = [
			SurveyQuestionnaire.onboarding,
			SurveyQuestionnaire.checkin,
			SurveyQuestionnaire.offboarding,
			SurveyQuestionnaire.offboarded_checkin,
		];

		for (const questionnaire of questionnaires) {
			const pages = getQuestionnaire(questionnaire, this.identityTranslate, '');
			for (const page of pages) {
				if (!page || typeof page !== 'object') {
					continue;
				}

				const elements = (page as { elements?: unknown }).elements;
				if (!Array.isArray(elements)) {
					continue;
				}

				for (const element of elements) {
					if (!this.isSupportedQuestionElement(element)) {
						continue;
					}

					const current = questionMap.get(element.name) ?? new Set<SurveyQuestionnaire>();
					current.add(questionnaire);
					questionMap.set(element.name, current);
				}
			}
		}

		SurveyImpactService.questionQuestionnairesCache = Object.fromEntries(
			Array.from(questionMap.entries()).map(([questionName, questionnaireSet]) => [
				questionName,
				Array.from(questionnaireSet),
			]),
		);

		return SurveyImpactService.questionQuestionnairesCache;
	}

	private shiftYears(date: Date, years: number): Date {
		const next = now();
		next.setTime(date.getTime());
		next.setFullYear(next.getFullYear() + years);

		return next;
	}

	private toAgeDateRanges(ageGroups: SurveyImpactRecipientAgeGroup[]): Prisma.DateTimeFilter[] {
		const currentDate = now();
		const ranges: Prisma.DateTimeFilter[] = [];

		for (const group of RECIPIENT_AGE_GROUPS) {
			if (!ageGroups.includes(group)) {
				continue;
			}

			const bounds = RECIPIENT_AGE_GROUP_BOUNDS[group];
			ranges.push({
				...(bounds.maxAge !== undefined ? { gte: this.shiftYears(currentDate, -bounds.maxAge) } : {}),
				...(bounds.minAge !== undefined ? { lte: this.shiftYears(currentDate, -bounds.minAge) } : {}),
			});
		}

		return ranges;
	}

	private getAgeGroupForDateOfBirth(dateOfBirth: Date | null): SurveyImpactRecipientAgeGroup | null {
		if (!dateOfBirth) {
			return null;
		}

		const today = now();
		const age = today.getFullYear() - dateOfBirth.getFullYear();
		const hasHadBirthdayThisYear =
			today.getMonth() > dateOfBirth.getMonth() ||
			(today.getMonth() === dateOfBirth.getMonth() && today.getDate() >= dateOfBirth.getDate());
		const normalizedAge = hasHadBirthdayThisYear ? age : age - 1;

		for (const group of RECIPIENT_AGE_GROUPS) {
			const bounds = RECIPIENT_AGE_GROUP_BOUNDS[group];
			const minAge = bounds.minAge ?? Number.NEGATIVE_INFINITY;
			const maxAge = bounds.maxAge ?? Number.POSITIVE_INFINITY;
			if (normalizedAge >= minAge && normalizedAge <= maxAge) {
				return group;
			}
		}

		return null;
	}

	private toBreakdownItems(counts: Map<string, number>, total: number, sortByCount = true): SurveyImpactStudyDetailItem[] {
		const items = Array.from(counts.entries()).map(([value, count]) => ({
			value,
			count,
			percentage: total > 0 ? (count / total) * 100 : 0,
		}));

		if (!sortByCount) {
			return items;
		}

		return items.sort((left, right) => right.count - left.count);
	}

	private toDaysAgo(date: Date | null): number | null {
		if (!date) {
			return null;
		}

		return Math.max(0, differenceInDays(nowMs(), date));
	}

	private toDaySpan(start: Date | null, end: Date | null): number | null {
		if (!start || !end) {
			return null;
		}

		return Math.max(0, differenceInDays(end, start));
	}

	private buildWhere(filters?: SurveyImpactFilters): Prisma.SurveyWhereInput {
		const where: Prisma.SurveyWhereInput = {
			status: SurveyStatus.completed,
		};

		if (!filters) {
			return where;
		}

		if (filters.questionnaires && filters.questionnaires.length > 0) {
			where.questionnaire = { in: filters.questionnaires };
		}

		if (filters.language) {
			where.language = filters.language;
		}

		if (filters.programIds || filters.countryIsoCodes || filters.recipientGenders || filters.recipientAgeGroups) {
			const contactWhere: Prisma.ContactWhereInput = {
				...(filters.recipientGenders && filters.recipientGenders.length > 0
					? { gender: { in: filters.recipientGenders } }
					: {}),
			};
			const ageDateRanges =
				filters.recipientAgeGroups && filters.recipientAgeGroups.length > 0
					? this.toAgeDateRanges(filters.recipientAgeGroups)
					: [];
			if (ageDateRanges.length > 0) {
				contactWhere.OR = ageDateRanges.map((range) => ({ dateOfBirth: range }));
			}

			where.recipient = {
				...(filters.programIds && filters.programIds.length > 0 ? { programId: { in: filters.programIds } } : {}),
				...(filters.countryIsoCodes && filters.countryIsoCodes.length > 0
					? { program: { country: { isoCode: { in: filters.countryIsoCodes } } } }
					: {}),
				...(Object.keys(contactWhere).length > 0 ? { contact: contactWhere } : {}),
			};
		}

		return where;
	}

	private toAnswerRecords(dataRows: Prisma.JsonValue[]): AnswerRecord[] {
		return dataRows
			.filter((row): row is Prisma.JsonObject => this.isJsonObject(row))
			.map((row) => {
				const answerRecord: AnswerRecord = {};
				for (const [key, value] of Object.entries(row)) {
					answerRecord[key] = value as Prisma.JsonValue;
				}

				return answerRecord;
			});
	}

	private aggregateSingleChoice(question: QuestionDefinition, responses: AnswerRecord[]): SurveyImpactQuestion {
		const questionQuestionnairesMap = this.getQuestionQuestionnairesMap();
		const counts = new Map<string, number>();
		for (const choice of question.choices) {
			counts.set(String(choice), 0);
		}

		let answeredCount = 0;
		for (const response of responses) {
			const answer = this.getAnswerValue(response, question.name);
			if (typeof answer !== 'string' && typeof answer !== 'boolean') {
				continue;
			}

			const answerKey = String(answer);
			if (!counts.has(answerKey)) {
				continue;
			}

			answeredCount += 1;
			counts.set(answerKey, (counts.get(answerKey) ?? 0) + 1);
		}

		const options = question.choices.map((choice) => {
			const value = String(choice);
			const count = counts.get(value) ?? 0;
			const percentage = answeredCount > 0 ? (count / answeredCount) * 100 : 0;

			return { value, count, percentage };
		});

		return {
			name: question.name,
			inputType: String(question.type),
			translationKey: question.translationKey,
			descriptionTranslationKey: question.descriptionTranslationKey,
			choicesTranslationKey: question.choicesTranslationKey,
			questionnaires: questionQuestionnairesMap[question.name] ?? defaultQuestionnaires,
			answeredCount,
			surveyCount: responses.length,
			options,
		};
	}

	private aggregateMultiChoice(question: QuestionDefinition, responses: AnswerRecord[]): SurveyImpactQuestion {
		const questionQuestionnairesMap = this.getQuestionQuestionnairesMap();
		const counts = new Map<string, number>();
		for (const choice of question.choices) {
			counts.set(String(choice), 0);
		}
		const hasPredefinedChoices = question.choices.length > 0;

		let answeredCount = 0;
		for (const response of responses) {
			const answer = this.getAnswerValue(response, question.name);
			if (!Array.isArray(answer)) {
				continue;
			}

			const selectedValues = new Set(
				answer.filter(
					(value): value is string => typeof value === 'string' && (hasPredefinedChoices ? counts.has(value) : true),
				),
			);

			if (selectedValues.size === 0) {
				continue;
			}

			answeredCount += 1;
			for (const selectedValue of selectedValues) {
				if (!counts.has(selectedValue)) {
					counts.set(selectedValue, 0);
				}
				counts.set(selectedValue, (counts.get(selectedValue) ?? 0) + 1);
			}
		}

		const optionValues = hasPredefinedChoices ? question.choices.map(String) : Array.from(counts.keys());
		const options = optionValues.map((value) => {
			const count = counts.get(value) ?? 0;
			const percentage = answeredCount > 0 ? (count / answeredCount) * 100 : 0;

			return { value, count, percentage };
		});

		return {
			name: question.name,
			inputType: String(question.type),
			translationKey: question.translationKey,
			descriptionTranslationKey: question.descriptionTranslationKey,
			choicesTranslationKey: question.choicesTranslationKey,
			questionnaires: questionQuestionnairesMap[question.name] ?? defaultQuestionnaires,
			answeredCount,
			surveyCount: responses.length,
			options,
		};
	}

	private aggregateComment(question: QuestionDefinition, responses: AnswerRecord[]): SurveyImpactQuestion {
		const questionQuestionnairesMap = this.getQuestionQuestionnairesMap();
		let answeredCount = 0;

		for (const response of responses) {
			const answer = this.getAnswerValue(response, question.name);
			if (!this.isNonEmptyString(answer)) {
				continue;
			}

			answeredCount += 1;
		}

		return {
			name: question.name,
			inputType: String(question.type),
			translationKey: question.translationKey,
			descriptionTranslationKey: question.descriptionTranslationKey,
			choicesTranslationKey: question.choicesTranslationKey,
			questionnaires: questionQuestionnairesMap[question.name] ?? defaultQuestionnaires,
			answeredCount,
			surveyCount: responses.length,
			options: [],
		};
	}

	private aggregateQuestion(question: QuestionDefinition, responses: AnswerRecord[]): SurveyImpactQuestion {
		const questionType = String(question.type);

		if (questionType === 'comment') {
			return this.aggregateComment(question, responses);
		}

		if (questionType === 'checkbox' || questionType === 'ranking') {
			return this.aggregateMultiChoice(question, responses);
		}

		return this.aggregateSingleChoice(question, responses);
	}

	async getImpactMeasurements(filters?: SurveyImpactFilters): Promise<ServiceResult<SurveyImpactData>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: this.buildWhere(filters),
				select: {
					data: true,
					questionnaire: true,
					recipientId: true,
					recipient: {
						select: {
							programId: true,
							program: {
								select: {
									country: {
										select: {
											isoCode: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
			});

			const surveyAnswers: SurveyAnswerRecord[] = surveys
				.map((survey) => {
					const parsed = this.toAnswerRecords([survey.data]);

					if (parsed.length === 0) {
						return null;
					}

					return {
						questionnaire: survey.questionnaire,
						answers: parsed[0],
					};
				})
				.filter((item): item is SurveyAnswerRecord => Boolean(item));
			const questions = this.getQuestionCatalog().map((question) => {
				const questionQuestionnairesMap = this.getQuestionQuestionnairesMap();
				const relevantQuestionnaires = questionQuestionnairesMap[question.name] ?? defaultQuestionnaires;
				const relevantResponses = surveyAnswers
					.filter((surveyAnswer) => relevantQuestionnaires.includes(surveyAnswer.questionnaire))
					.map((surveyAnswer) => surveyAnswer.answers);

				return this.aggregateQuestion(question, relevantResponses);
			});
			const totalRecipients = new Set(surveys.map((survey) => survey.recipientId)).size;
			const totalPrograms = new Set(surveys.map((survey) => survey.recipient.programId).filter(Boolean)).size;
			const totalCountries = new Set(
				surveys
					.map((survey) => survey.recipient.program?.country?.isoCode)
					.filter((country): country is CountryCode => Boolean(country)),
			).size;
			const totalQuestionnaires = new Set(surveys.map((survey) => survey.questionnaire)).size;

			return this.resultOk({
				totalCompletedSurveys: surveys.length,
				totalRecipients,
				totalCountries,
				totalPrograms,
				totalQuestionnaires,
				questions,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load survey impact measurements: ${JSON.stringify(error)}`);
		}
	}

	async getImpactFilterOptions(): Promise<ServiceResult<SurveyImpactFilterOptions>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: { status: SurveyStatus.completed },
				select: {
					questionnaire: true,
					recipient: {
						select: {
							program: {
								select: {
									id: true,
									name: true,
									country: {
										select: {
											isoCode: true,
										},
									},
								},
							},
						},
					},
				},
			});

			const countrySet = new Set<string>();
			const programMap = new Map<string, string>();
			const questionnaireSet = new Set<string>();

			for (const survey of surveys) {
				questionnaireSet.add(survey.questionnaire);
				const program = survey.recipient.program;
				if (!program) {
					continue;
				}
				if (program.country?.isoCode) {
					countrySet.add(program.country.isoCode);
				}
				programMap.set(program.id, program.name);
			}

			const countries = Array.from(countrySet)
				.sort((left, right) => left.localeCompare(right))
				.map((isoCode) => ({ value: isoCode, label: isoCode }));
			const programs = Array.from(programMap.entries())
				.sort((left, right) => left[1].localeCompare(right[1]))
				.map(([id, name]) => ({ value: id, label: name }));
			const questionnaires = Array.from(questionnaireSet)
				.sort((left, right) => left.localeCompare(right))
				.map((questionnaire) => ({ value: questionnaire, label: questionnaire }));

			return this.resultOk({
				countries,
				programs,
				questionnaires,
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load survey impact filter options: ${JSON.stringify(error)}`);
		}
	}

	async getImpactStudyDetails(filters?: SurveyImpactFilters): Promise<ServiceResult<SurveyImpactStudyDetails>> {
		try {
			const surveys = await this.db.survey.findMany({
				where: this.buildWhere(filters),
				select: {
					completedAt: true,
					recipientId: true,
					recipient: {
						select: {
							contact: {
								select: {
									gender: true,
									dateOfBirth: true,
								},
							},
							program: {
								select: {
									country: {
										select: {
											isoCode: true,
										},
									},
								},
							},
						},
					},
				},
				orderBy: [{ completedAt: 'desc' }, { createdAt: 'desc' }],
			});

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

				const ageGroup = this.getAgeGroupForDateOfBirth(recipient.contact?.dateOfBirth ?? null);
				if (ageGroup) {
					ageCounts.set(ageGroup, (ageCounts.get(ageGroup) ?? 0) + 1);
				}
			}

			const lastCompletedAt = surveys.find((survey) => survey.completedAt !== null)?.completedAt ?? null;
			const completedAtDates = surveys
				.map((survey) => survey.completedAt)
				.filter((completedAt): completedAt is Date => completedAt instanceof Date);
			const timeFrameStart = completedAtDates.length > 0 ? min(completedAtDates) : null;
			const timeFrameEnd = completedAtDates.length > 0 ? max(completedAtDates) : null;

			return this.resultOk({
				totalCompletedSurveys: surveys.length,
				totalRecipients: uniqueRecipients.size,
				lastResponseDaysAgo: this.toDaysAgo(lastCompletedAt),
				timeFrameStart,
				timeFrameEnd,
				timeFrameDays: this.toDaySpan(timeFrameStart, timeFrameEnd),
				countryBreakdown: this.toBreakdownItems(countryCounts, uniqueRecipients.size),
				genderBreakdown: this.toBreakdownItems(genderCounts, uniqueRecipients.size, false),
				ageBreakdown: this.toBreakdownItems(ageCounts, uniqueRecipients.size, false),
			});
		} catch (error) {
			this.logger.error(error);

			return this.resultFail(`Could not load survey impact study details: ${JSON.stringify(error)}`);
		}
	}
}

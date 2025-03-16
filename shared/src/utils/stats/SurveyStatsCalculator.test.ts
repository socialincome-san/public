import { beforeAll, expect, test } from '@jest/globals';
import functions from 'firebase-functions-test';
import { getOrInitializeFirebaseAdmin } from '../../firebase/admin/app';
import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '../../firebase/admin/utils';
import { EMPLOYMENT_STATUS, SPENDING, UNEXPECTED_EXPENSES_COVERED } from '../../types/question';
import { RECIPIENT_FIRESTORE_PATH, RecipientMainLanguage } from '../../types/recipient';
import { SURVEY_FIRETORE_PATH, SurveyQuestionnaire, SurveyStatus } from '../../types/survey';
import { SurveyStatsCalculator } from './SurveyStatsCalculator';

const projectId = 'survey-stats-calculator-test';
const testEnv = functions({ projectId });
const firestoreAdmin = new FirestoreAdmin(getOrInitializeFirebaseAdmin({ projectId }));
let calculator: SurveyStatsCalculator;

beforeAll(async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });
	await insertTestData();
	calculator = await SurveyStatsCalculator.build(firestoreAdmin);
});
const OLDEST_DATE = new Date('2022-01-01');

test('building SurveyStatsCalculator', async () => {
	expect(calculator.aggregatedData).toBeDefined();
	expect(calculator.aggregatedData.length).toBeGreaterThan(0);
	expect(calculator.oldestDate.getFullYear()).toEqual(OLDEST_DATE.getFullYear());
	expect(calculator.oldestDate.getMonth()).toEqual(OLDEST_DATE.getMonth());
	expect(calculator.oldestDate.getDay()).toEqual(OLDEST_DATE.getDay());
});

test('calculate overall survey stats', async () => {
	expect(calculator.aggregatedData[SurveyQuestionnaire.Checkin]).toContainEqual(
		expect.objectContaining({
			completedSurveys: 3,
		}),
	);
	expect(calculator.aggregatedData[SurveyQuestionnaire.Onboarding]).toContainEqual(
		expect.objectContaining({
			completedSurveys: 1,
		}),
	);
	expect(calculator.aggregatedData[SurveyQuestionnaire.OffboardedCheckin]).toContainEqual(
		expect.objectContaining({
			completedSurveys: 3,
		}),
	);
	expect(calculator.aggregatedData[SurveyQuestionnaire.Offboarding]).toContainEqual(
		expect.objectContaining({
			completedSurveys: 1,
		}),
	);
});

test('calculate aggregated survey responses by question type', async () => {
	const aggregatedData = calculator.aggregatedData;
	expect(aggregatedData).toBeDefined();

	const checkinData = aggregatedData[SurveyQuestionnaire.Checkin].answersByQuestionType;
	const offboardedCheckin = aggregatedData[SurveyQuestionnaire.OffboardedCheckin].answersByQuestionType;

	// RADIO_GROUP text
	expect(checkinData[EMPLOYMENT_STATUS.name].answers['selfEmployed']).toBe(2);
	expect(checkinData[EMPLOYMENT_STATUS.name].answers['employed']).toBe(1);

	// RADIO_GROUP boolean
	expect(offboardedCheckin[UNEXPECTED_EXPENSES_COVERED.name].answers['true']).toBe(2);
	expect(offboardedCheckin[UNEXPECTED_EXPENSES_COVERED.name].answers['false']).toBe(1);

	// CHECKBOX type
	expect(checkinData[SPENDING.name].answers['food']).toBe(2);
	expect(checkinData[SPENDING.name].answers['housing']).toBe(2);
});

test('handle edge cases with empty data', async () => {
	await testEnv.firestore.clearFirestoreData({ projectId });
	const emptyCalculator = await SurveyStatsCalculator.build(firestoreAdmin);
	expect(emptyCalculator.aggregatedData).toEqual([]);
	expect(emptyCalculator.aggregatedData).toEqual({
		[SurveyQuestionnaire.Checkin]: {},
		[SurveyQuestionnaire.Onboarding]: {},
		[SurveyQuestionnaire.OffboardedCheckin]: {},
		[SurveyQuestionnaire.Offboarding]: {},
	});
});

const surveyRecords = [
	[
		{
			questionnaire: SurveyQuestionnaire.Checkin,
			recipient_name: 'John Doe',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				employmentStatusV1: 'selfEmployed', // RADIO_GROUP
				spendingV1: ['housing'], // CHECKBOX
				plannedAchievementRemainingV1: 'Save for a car', // COMMENT
			},
			access_email: 'john.doe@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.Checkin,
			recipient_name: 'Jane Smith',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				employmentStatusV1: 'employed', // RADIO_GROUP
				spendingV1: ['food'], // CHECKBOX
				plannedAchievementRemainingV1: 'Buy a house', // COMMENT
			},
			access_email: 'jane.smith@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.Checkin,
			recipient_name: 'Alice Brown',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(OLDEST_DATE),
			status: SurveyStatus.Completed,
			data: {
				employmentStatusV1: 'selfEmployed', // RADIO_GROUP
				spendingV1: ['housing', 'food'], // CHECKBOX (multiple selections)
			},
			access_email: 'alice.brown@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
	],

	[
		{
			questionnaire: SurveyQuestionnaire.Onboarding,
			recipient_name: 'Alice Brown',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				livingLocationV1: 'easternProvince', // RADIO_GROUP
				plannedAchievementV1: 'Save for a car', // COMMENT
				unexpectedExpensesCoveredV1: false,
			},
			access_email: 'alice.brown@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.OffboardedCheckin,
			recipient_name: 'Bob Green',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				unexpectedExpensesCoveredV1: false, // BOOLEAN
			},
			access_email: 'bob.green@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.OffboardedCheckin,
			recipient_name: 'Bob Green',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				unexpectedExpensesCoveredV1: true, // BOOLEAN
			},
			access_email: 'bob.green@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.OffboardedCheckin,
			recipient_name: 'Bob Green',
			language: RecipientMainLanguage.English,
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				maritalStatusV1: 'married', // RADIO_GROUP
				unexpectedExpensesCoveredV1: true, // BOOLEAN
			},
			access_email: 'bob.green@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
		{
			questionnaire: SurveyQuestionnaire.Offboarding,
			recipient_name: 'Bob Green',
			language: 'en',
			due_date_at: toFirebaseAdminTimestamp(new Date()),
			sent_at: toFirebaseAdminTimestamp(new Date()),
			completed_at: toFirebaseAdminTimestamp(new Date()),
			status: SurveyStatus.Completed,
			data: {
				maritalStatusV1: 'married', // RADIO_GROUP
				unexpectedExpensesCoveredV1: true, // BOOLEAN
			},
			access_email: 'bob.green@example.com',
			access_pw: 'password123',
			access_token: 'token123',
		},
	],
];
const insertTestData = async () => {
	for (let surveyData of surveyRecords) {
		for (let is_test of [false, true]) {
			const recipientRef = await firestoreAdmin.collection(RECIPIENT_FIRESTORE_PATH).add({ test_recipient: is_test });
			await Promise.all(
				surveyData.map((survey) =>
					firestoreAdmin
						.collection(`${RECIPIENT_FIRESTORE_PATH}/${recipientRef.id}/${SURVEY_FIRETORE_PATH}`)
						.add(survey),
				),
			);
		}
	}
};

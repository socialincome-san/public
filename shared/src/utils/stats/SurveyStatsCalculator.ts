import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Question, QuestionInputType, QUESTIONS_DICTIONARY } from '../../types/question';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '../../types/recipient';
import { Survey, SURVEY_FIRETORE_PATH, SurveyQuestionnaire, SurveyStatus } from '../../types/survey';

export interface SurveyStats {
	total: number;
	type: SurveyQuestionnaire;
}

export interface SurveyAnswersByType {
	answers: { [type: string]: number };
	total: number;
	question: Question;
}

const SUPPORTED_SURVEY_QUESTION_TYPES = [QuestionInputType.RADIO_GROUP, QuestionInputType.CHECKBOX];

export class SurveyStatsCalculator {
	private readonly _data: SurveyStats[];
	private readonly _aggregatedData: { [key: string]: { [key: string]: SurveyAnswersByType } };
	private readonly _oldestDate: Date;

	private constructor(
		data: SurveyStats[],
		aggregatedData: { [key: string]: { [key: string]: SurveyAnswersByType } },
		oldestDate: Date,
	) {
		this._data = data;
		this._aggregatedData = aggregatedData;
		this._oldestDate = oldestDate;
	}

	/**
	 * Builds a new instance of SurveyStatsCalculator
	 * @param firestoreAdmin Firestore admin instance for accessing the database
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<SurveyStatsCalculator> {
		const recipients = await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();
		const surveysData = await this.fetchAndProcessSurveys(firestoreAdmin, recipients);
		const { typeCounts, aggregatedData, oldestDate } = this.aggregateSurveyData(surveysData);
		const data = Object.entries(typeCounts).map(([type, total]) => ({ type, total }) as SurveyStats);
		return new SurveyStatsCalculator(data, aggregatedData, oldestDate);
	}

	private static async fetchAndProcessSurveys(
		firestoreAdmin: FirestoreAdmin,
		recipients: FirebaseFirestore.QuerySnapshot<Recipient>,
	): Promise<Survey[]> {
		const surveySnapshots = await Promise.all(
			recipients.docs
				.filter((recipient) => !recipient.get('test_recipient'))
				.map((recipient) =>
					firestoreAdmin
						.collection<Survey>(`${RECIPIENT_FIRESTORE_PATH}/${recipient.id}/${SURVEY_FIRETORE_PATH}`)
						.get(),
				),
		);
		return surveySnapshots.flatMap((snapshot) => snapshot.docs.map((doc) => doc.data()));
	}

	private static aggregateSurveyData(surveysData: Survey[]): {
		typeCounts: { [type: string]: number };
		aggregatedData: { [key: string]: { [key: string]: SurveyAnswersByType } };
		oldestDate: Date;
	} {
		const aggregatedData: { [key: string]: { [key: string]: SurveyAnswersByType } } = {};
		const typeCounts: { [type: string]: number } = {};
		let oldestDate = new Date();

		surveysData.forEach((survey) => {
			if (this.isCompletedSurvey(survey)) {
				oldestDate =
					survey.completed_at?.toDate() && survey.completed_at?.toDate() < oldestDate
						? survey.completed_at.toDate()
						: oldestDate;
				const questionnaire = survey.questionnaire!;
				typeCounts[questionnaire] = (typeCounts[questionnaire] || 0) + 1;
				Object.entries(survey.data!).forEach(([questionKey, response]) => {
					this.processSurveyResponse(aggregatedData, questionnaire, questionKey, response);
				});
			}
		});

		return { typeCounts, aggregatedData, oldestDate };
	}

	private static isCompletedSurvey(survey: Survey): boolean {
		return !!(survey.data && survey.questionnaire && survey.status === SurveyStatus.Completed);
	}

	private static processSurveyResponse(
		aggregatedData: { [key: string]: { [key: string]: SurveyAnswersByType } },
		questionnaire: string,
		questionKey: string,
		response: any,
	): void {
		const question = QUESTIONS_DICTIONARY.get(questionKey);
		if (!question || !SUPPORTED_SURVEY_QUESTION_TYPES.includes(question.type)) return;

		aggregatedData[questionnaire] = aggregatedData[questionnaire] || {};
		aggregatedData[questionnaire][questionKey] = aggregatedData[questionnaire][questionKey] || {
			answers: {},
			total: 0,
			question,
		};
		const questionData = aggregatedData[questionnaire][questionKey];

		if (question.type === QuestionInputType.CHECKBOX) {
			(response as string[]).forEach((value) => {
				questionData.answers[value] = (questionData.answers[value] || 0) + 1;
			});
		} else if (question.type === QuestionInputType.RADIO_GROUP) {
			const responseValue = response as string;
			questionData.answers[responseValue] = (questionData.answers[responseValue] || 0) + 1;
		}
		questionData.total++;
	}

	get oldestDate(): Date {
		return this._oldestDate;
	}

	get data(): SurveyStats[] {
		return this._data;
	}

	get aggregatedData(): { [key: string]: { [key: string]: SurveyAnswersByType } } {
		return this._aggregatedData;
	}
}

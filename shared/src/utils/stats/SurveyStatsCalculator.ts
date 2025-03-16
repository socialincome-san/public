import { FirestoreAdmin } from '../../firebase/admin/FirestoreAdmin';
import { Question, QuestionInputType, QUESTIONS_DICTIONARY } from '../../types/question';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '../../types/recipient';
import { Survey, SURVEY_FIRETORE_PATH, SurveyQuestionnaire, SurveyStatus } from '../../types/survey';

export interface SurveyStats {
	completedSurveys: number;
	totalAnswersForAllQuestions: number;
	answersByQuestionType: { [questionKey: string]: SurveyAnswersByType };
}

export interface SurveyAnswersByType {
	answers: { [type: string]: number };
	total: number;
	question: Question;
}

const SUPPORTED_SURVEY_QUESTION_TYPES = [QuestionInputType.RADIO_GROUP, QuestionInputType.CHECKBOX];

export class SurveyStatsCalculator {
	private readonly _oldestDate: Date;
	private readonly _aggregatedData: { [surveyType: string]: SurveyStats };

	private constructor(data: { [surveyType: string]: SurveyStats }, oldestDate: Date) {
		this._aggregatedData = data;
		this._oldestDate = oldestDate;
	}

	get aggregatedData(): { [surveyType: string]: SurveyStats } {
		return this._aggregatedData;
	}

	get oldestDate(): Date {
		return this._oldestDate;
	}

	/**
	 * Builds a new instance of SurveyStatsCalculator
	 * @param firestoreAdmin Firestore admin instance for accessing the database
	 */
	static async build(firestoreAdmin: FirestoreAdmin): Promise<SurveyStatsCalculator> {
		const recipients = await firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();
		const surveysData = await this.fetchAndProcessSurveys(firestoreAdmin, recipients);

		const betterData: { [surveyType: string]: SurveyStats } = {};
		const { oldestDate } = this.aggregateSurveyData(surveysData, betterData);
		return new SurveyStatsCalculator(betterData, oldestDate);
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

	private static aggregateSurveyData(
		surveysData: Survey[],
		betterData: { [p: string]: SurveyStats },
	): {
		oldestDate: Date;
	} {
		let oldestDate = new Date();

		surveysData.forEach((survey) => {
			if (this.isCompletedSurvey(survey)) {
				oldestDate =
					survey.completed_at?.toDate() && survey.completed_at?.toDate() < oldestDate
						? survey.completed_at.toDate()
						: oldestDate;
				const questionnaire = survey.questionnaire!;
				betterData[questionnaire] = this.initiate(betterData, questionnaire);
				betterData[questionnaire].completedSurveys = betterData[questionnaire].completedSurveys + 1;

				Object.entries(survey.data!).forEach(([questionKey, response]) => {
					this.processSurveyResponse(betterData[questionnaire], questionKey, response);
				});
			}
		});

		return { oldestDate };
	}

	private static initiate(betterData: { [p: string]: SurveyStats }, questionnaire: SurveyQuestionnaire) {
		return (
			betterData[questionnaire] || {
				completedSurveys: 0,
				totalAnswersForAllQuestions: 0,
				answersByQuestionType: {},
			}
		);
	}

	private static isCompletedSurvey(survey: Survey): boolean {
		return !!(survey.data && survey.questionnaire && survey.status === SurveyStatus.Completed);
	}

	private static processSurveyResponse(aggregatedData: SurveyStats, questionKey: string, response: any): void {
		const question = QUESTIONS_DICTIONARY.get(questionKey);
		if (!question || !SUPPORTED_SURVEY_QUESTION_TYPES.includes(question.type)) return;

		aggregatedData.answersByQuestionType[questionKey] = this.initiateAnswersByQuestionType(
			aggregatedData,
			questionKey,
			question,
		);
		const questionData = aggregatedData.answersByQuestionType[questionKey];

		if (question.type === QuestionInputType.CHECKBOX) {
			(response as string[]).forEach((value) => {
				questionData.answers[value] = (questionData.answers[value] || 0) + 1;
			});
		} else if (question.type === QuestionInputType.RADIO_GROUP) {
			const responseValue = response as string;
			questionData.answers[responseValue] = (questionData.answers[responseValue] || 0) + 1;
		}
		questionData.total++;
		aggregatedData.totalAnswersForAllQuestions++;
	}

	private static initiateAnswersByQuestionType(aggregatedData: SurveyStats, questionKey: string, question: Question) {
		return (
			aggregatedData.answersByQuestionType[questionKey] || {
				answers: {},
				total: 0,
				question,
			}
		);
	}
}

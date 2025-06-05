import { DateTime } from 'luxon';
import { AuthAdmin } from '../../../../../../shared/src/firebase/admin/AuthAdmin';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { toFirebaseAdminTimestamp } from '../../../../../../shared/src/firebase/admin/utils';
import {
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	RecipientMainLanguage,
	RecipientProgramStatus,
} from '../../../../../../shared/src/types/recipient';
import {
	recipientSurveys,
	Survey,
	SURVEY_FIRETORE_PATH,
	SurveyQuestionnaire,
	SurveyStatus,
} from '../../../../../../shared/src/types/survey';
import { rndString } from '../../../../../../shared/src/utils/crypto';
import { toDateTime } from '../../../../../../shared/src/utils/date';

/**
 * Takes care of creating surveys for recipients
 */
export class SurveyManager {
	/**
	 * Create all surveys for 1 recipient. TODO trigger this method when a recipient gets selected.
	 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
	 */

	private readonly authAdmin: AuthAdmin;
	private readonly firestoreAdmin: FirestoreAdmin;

	constructor() {
		this.authAdmin = new AuthAdmin();
		this.firestoreAdmin = new FirestoreAdmin();
	}

	batchCreateSurveys = async () => {
		const recipients = await this.firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();
		await Promise.all(
			recipients.docs
				.filter((recipient) => recipient.data().progr_status != RecipientProgramStatus.Waitlisted)
				.map(async (recipient) => this.createAllSurveysForRecipient(recipient)),
		);
	};

	createAllSurveysForRecipient = async (recipient: FirebaseFirestore.QueryDocumentSnapshot<Recipient>) => {
		if (!recipient.get('si_start_date')) {
			console.log('No start date for recipient ${}');
			return Promise.resolve();
		}
		return Promise.all(
			recipientSurveys.map(async (survey) => {
				try {
					const dueDate = toDateTime(recipient.get('si_start_date')).plus({ months: survey.startDateOffsetMonths });
					const surveyStatus = dueDate < DateTime.now() ? SurveyStatus.Missed : SurveyStatus.New;
					await this.createSurvey(
						recipient.id,
						survey.questionaire,
						survey.name,
						recipient.data().first_name,
						recipient.data().main_language || RecipientMainLanguage.Krio,
						surveyStatus,
						dueDate.toJSDate(),
					);
				} catch {
					console.error(`Could not create ${survey.questionaire} survey for recipient ${recipient.id}`);
				}
			}),
		);
	};

	/**
	 * First checks if the survey already exists and return without any action if so.
	 * Otherwise, create a new auth user specifically for this survey.
	 * This will be used in the firestore security rules to check if someone can update a survey.
	 */
	createSurvey = async (
		recipientId: string,
		questionnaire: SurveyQuestionnaire,
		surveyName: string,
		recipientName: string,
		language: RecipientMainLanguage,
		status: SurveyStatus,
		due_date_at: Date,
	) => {
		const surveysCollection = this.firestoreAdmin.collection<Survey>(
			[RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH].join('/'),
		);
		const surveyDocRef = surveysCollection.doc(surveyName);
		if (!(await surveyDocRef.get()).exists) {
			const email = (await rndString(16)).toLowerCase() + '@si.org';
			const password = await rndString(16);
			const token = await rndString(3, 'hex');
			await this.authAdmin.auth.createUser({
				email,
				password,
				emailVerified: true,
			});
			await surveyDocRef.create({
				questionnaire: questionnaire,
				recipient_name: recipientName,
				language: language,
				status: status,
				data: {},
				due_date_at: toFirebaseAdminTimestamp(due_date_at),
				access_email: email,
				access_pw: password,
				access_token: token,
			});
			console.log(`Created survey ${surveyName} for recipient ${recipientId}.`);
			return Promise.resolve();
		} else {
			console.log(`Skipping creation of survey ${surveyName} for recipient ${recipientId} because it already exists.`);
			return Promise.resolve();
		}
	};
}

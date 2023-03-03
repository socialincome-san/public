import * as functions from 'firebase-functions';
import moment from 'moment';
import { AuthAdmin } from '../../../shared/src/firebase/AuthAdmin';
import { FirestoreAdmin } from '../../../shared/src/firebase/FirestoreAdmin';
import {
	Recipient,
	RecipientMainLanguage,
	RecipientProgramStatus,
	RECIPIENT_FIRESTORE_PATH,
} from '../../../shared/src/types/admin/Recipient';
import {
	recipientSurveys,
	Survey,
	SurveyQuestionnaire,
	SurveyStatus,
	SURVEY_FIRETORE_PATH,
} from '../../../shared/src/types/admin/Survey';
import { rndBase64 } from '../../../shared/src/utils/crypto';

/**
 * Takes care of creating surveys for recipients
 */
export class SurveyManager {
	readonly firestoreAdmin: FirestoreAdmin;
	readonly authAdmin: AuthAdmin;

	constructor(firestoreAdmin: FirestoreAdmin, authAdmin: AuthAdmin) {
		this.firestoreAdmin = firestoreAdmin;
		this.authAdmin = authAdmin;
	}

	/**
	 * Batch implementation to create all surveys for all recipients.
	 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
	 */
	createAllSurveys = functions.https.onCall(async (_, { auth }) => {
		await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

		const recipients = await this.firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();

		await Promise.all(
			recipients.docs
				.filter((recipient) => recipient.data().progr_status != RecipientProgramStatus.Waitlisted)
				.map(async (recipient) => this.createAllSurveysForRecipient(recipient))
		);
	});

	/**
	 * Create all surveys for 1 recipient. TODO trigger this method when a recipient gets selected.
	 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
	 */
	createAllSurveysForRecipient = async (recipient: FirebaseFirestore.QueryDocumentSnapshot<Recipient>) => {
		if (recipient.data().si_start_date) {
			return Promise.all(
				recipientSurveys.map(async (survey) => {
					const dueDate = moment(recipient.data().si_start_date).add(survey.startDateOffsetMonths, 'M');
					const surveyStatus = dueDate.isBefore(moment()) ? SurveyStatus.Missed : SurveyStatus.New;
					await this.createSurvey(
						recipient.id,
						survey.questionaire,
						survey.name,
						recipient.data().first_name,
						recipient.data().main_language,
						surveyStatus,
						dueDate.toDate()
					);
				})
			);
		} else {
			console.log('No start date for recipient ${}');
			return Promise.resolve();
		}
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
		due_date_at: Date
	) => {
		const surveysCollection = this.firestoreAdmin.collection<Survey>(
			[RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH].join('/')
		);
		const surveyDocRef = surveysCollection.doc(surveyName);
		if (!(await surveyDocRef.get()).exists) {
			const email = rndBase64(64).toLowerCase() + '@socialincome.org';
			const password = rndBase64(64);
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
				due_date_at: due_date_at,
				access_email: email,
				access_pw: password,
			});
			console.log(`Created survey ${surveyName} for recipient ${recipientId}.`);
			return Promise.resolve();
		} else {
			console.log(`Skipping creation of survey ${surveyName} for recipient ${recipientId} because it already exists.`);
			return Promise.resolve();
		}
	};
}

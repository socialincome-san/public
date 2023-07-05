import { Timestamp } from '@google-cloud/firestore';
import * as functions from 'firebase-functions';
import { DateTime } from 'luxon';
import {
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	RecipientMainLanguage,
	RecipientProgramStatus,
	SURVEY_FIRETORE_PATH,
	Survey,
	SurveyQuestionnaire,
	SurveyStatus,
	recipientSurveys,
} from '../../../../../shared/src/types';
import { rndString } from '../../../../../shared/src/utils/crypto';
import { AbstractFirebaseAdmin, FunctionProvider } from '../../../firebase';

/**
 * Takes care of creating surveys for recipients
 */
export class SurveyManager extends AbstractFirebaseAdmin implements FunctionProvider {
	/**
	 * Batch implementation to create all surveys for all recipients.
	 * Checks for existing surveys and ignores them. So, it can be called multiple times without creating duplicates.
	 */
	getFunction = () =>
		functions
			.runWith({
				timeoutSeconds: 540,
				memory: '2GB',
			})
			.https.onCall(async (_, { auth }) => {
				await this.firestoreAdmin.assertGlobalAdmin(auth?.token?.email);

				const recipients = await this.firestoreAdmin.collection<Recipient>(RECIPIENT_FIRESTORE_PATH).get();

				await Promise.all(
					recipients.docs
						.filter((recipient) => recipient.data().progr_status != RecipientProgramStatus.Waitlisted)
						.map(async (recipient) => this.createAllSurveysForRecipient(recipient)),
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
					try {
						const dueDate = DateTime.fromJSDate((recipient.data().si_start_date as Timestamp).toDate()).plus({
							months: survey.startDateOffsetMonths,
						});
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
		due_date_at: Date,
	) => {
		const surveysCollection = this.firestoreAdmin.collection<Survey>(
			[RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH].join('/'),
		);
		const surveyDocRef = surveysCollection.doc(surveyName);
		if (!(await surveyDocRef.get()).exists) {
			const email = rndString(16).toLowerCase() + '@si.org';
			const password = rndString(16);
			const token = rndString(3, 'hex');
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

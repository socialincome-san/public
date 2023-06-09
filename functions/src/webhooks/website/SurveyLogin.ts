import assert from 'assert';
import * as functions from 'firebase-functions';
import {
	Recipient,
	RECIPIENT_FIRESTORE_PATH,
	Survey,
	SurveyCredentialRequest,
	SurveyCredentialResponse,
	SURVEY_FIRETORE_PATH,
} from '../../../../shared/src/types';
import { AbstractFirebaseAdmin, FunctionProvider } from '../../firebase';

export class SurveyLogin extends AbstractFirebaseAdmin implements FunctionProvider {
	getFunction = () => {
		return functions.https.onCall(async (props: SurveyCredentialRequest) => {
			const recipient = await this.firestoreAdmin.findFirst<Recipient>(RECIPIENT_FIRESTORE_PATH, (q) =>
				q.where('mobile_money_phone.phone', '==', Number(props.phoneNumber))
			);

			assert(recipient != undefined, 'Recipient not found');

			const survey = await this.firestoreAdmin.findFirst<Survey>(
				[recipient.ref.path, SURVEY_FIRETORE_PATH].join('/'),
				(q) => q.where('access_token', '==', props.accessToken)
			);

			assert(survey != undefined, 'Survey not found');

			const response: SurveyCredentialResponse = {
				recipientId: recipient.id,
				surveyId: survey.id,
				email: survey.data().access_email,
				pw: survey.data().access_pw,
			};
			return response;
		});
	};
}

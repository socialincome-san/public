import assert from 'assert';
import * as functions from 'firebase-functions';
import { FirestoreAdmin } from '../../../../../shared/src/firebase/admin/FirestoreAdmin';
import {
	RECIPIENT_FIRESTORE_PATH,
	Recipient,
	SURVEY_FIRETORE_PATH,
	Survey,
	SurveyCredentialRequest,
	SurveyCredentialResponse,
} from '../../../../../shared/src/types';

export default functions.https.onCall(async (props: SurveyCredentialRequest) => {
	const firestoreAdmin = new FirestoreAdmin();

	const recipient = await firestoreAdmin.findFirst<Recipient>(RECIPIENT_FIRESTORE_PATH, (q) =>
		q.where('mobile_money_phone.phone', '==', Number(props.phoneNumber)),
	);

	assert(recipient != undefined, 'Recipient not found');

	const survey = await firestoreAdmin.findFirst<Survey>([recipient.ref.path, SURVEY_FIRETORE_PATH].join('/'), (q) =>
		q.where('access_token', '==', props.accessToken),
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

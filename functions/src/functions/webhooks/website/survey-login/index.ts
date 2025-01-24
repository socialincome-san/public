import assert from 'assert';
import { onCall } from 'firebase-functions/v2/https';
import { FirestoreAdmin } from '../../../../../../shared/src/firebase/admin/FirestoreAdmin';
import { Recipient, RECIPIENT_FIRESTORE_PATH } from '../../../../../../shared/src/types/recipient';
import {
	Survey,
	SURVEY_FIRETORE_PATH,
	SurveyCredentialRequest,
	SurveyCredentialResponse,
} from '../../../../../../shared/src/types/survey';

export default onCall<SurveyCredentialRequest, Promise<SurveyCredentialResponse>>(async (request) => {
	const firestoreAdmin = new FirestoreAdmin();

	const recipient = await firestoreAdmin.findFirst<Recipient>(RECIPIENT_FIRESTORE_PATH, (q) =>
		q.where('mobile_money_phone.phone', '==', Number(request.data.phoneNumber)),
	);

	assert(recipient != undefined, 'Recipient not found');

	const survey = await firestoreAdmin.findFirst<Survey>([recipient.ref.path, SURVEY_FIRETORE_PATH].join('/'), (q) =>
		q.where('access_token', '==', request.data.accessToken),
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

import * as functions from 'firebase-functions';

export const dummyFunction = functions.https.onCall((data, context) => {
	return 'Hakuna Matata';
});

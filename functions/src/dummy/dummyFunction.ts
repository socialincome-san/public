import * as functions from 'firebase-functions';

export const dummyFunction = functions.https.onCall((data, context) => {
	console.log(data);
	return 'Hakuna Matata';
});

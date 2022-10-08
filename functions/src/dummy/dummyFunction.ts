import * as functions from 'firebase-functions/v2';

export const dummyFunction = functions.https.onCall<number>({ cors: ['socialincome.org', 'web.app'] }, (request) => {
	console.log(request.data);
	return 'Hakuna Matata';
});

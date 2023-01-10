import * as functions from 'firebase-functions';
import { useFirestore } from '../../../shared/src/firebase/firestoreAdmin';

/**
 * Twilio webhook to ingest status update of message inbox into firestore.
 * Adds the relevant information to the contributions subcollection of users.
 * Testing can be done via Twilio Webhook CLI: https://www.twilio.com/blog/validate-webhooks-with-new-webhook-plugin-for-twilio-cli
 * Example request: twilio webhook:invoke http://localhost:5001/social-income-prod/us-central1/twilioStatusWebhook --no-signature -d SmsStatus=sent -d SmsSid=SM9c3475ba640511a580ca8a94e0641a66
 */

export const twilioStatusWebhookFunction = functions.https.onRequest(async (request, response) => {
	const SmsSid = request.body?.SmsSid;
	const firestore = useFirestore();

	const smsQuery = firestore.collectionGroup('message-inbox').where('twilio_id', '==', SmsSid);
	smsQuery.get().then((querySnapshot) => {
		try {
			if (querySnapshot.size < 1) {
				throw new Error('No corresponding inbox message item found.');
			} else {
				querySnapshot.forEach((doc) => {
					doc.ref
						.update({ status: request.body.SmsStatus })
						.then(() => console.log(`Status updated for ${SmsSid} of user ${doc.ref.parent.parent?.id}`));
				});
			}
			response.send();
		} catch (e) {
			console.error(e);
		}
	});
});

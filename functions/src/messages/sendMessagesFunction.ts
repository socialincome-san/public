import * as functions from 'firebase-functions';
import { MessageTemplate } from '@socialincome/shared/types';
import  twilio from 'twilio'

const twilioAccountSid = '<twilio-account-sid>'; // TODO put this twilioAccountSid GitHub secrets
const twilioAuthToken = '<twilio-auth-token>'; // TODO put this twilioAuthToken GitHub secrets
const twilioMessagingServiceSid = '<twilio-messaging-service-sid>'; // TODO put twilioMessagingServiceSid in GitHub secrets

const client = twilio(twilioAccountSid, twilioAuthToken)

export const sendMessagesFunction = functions.https.onCall((messages: MessageTemplate[], context) => {
	console.log('Sending all messages via Twilio...')
	console.log('Messages:', messages);

	const twilioMessages = messages.map((messageTemplate) =>
		client.messages
			.create({
				body: messageTemplate.text_krio,
				messagingServiceSid: twilioMessagingServiceSid,
				to: '+' + messageTemplate.recipient // NOTE the plus needs to be prepended here because the `recipient` member only contains the number (including calling code) without the plus at the beginning
			})
			.then((message) => console.log(`Msg - SID: ${message.sid}; to: ${message.to}; status: ${message.status}`))
			.catch((err) => {console.log('Error while trying to create and send twilio message:', err)})
	);

	Promise.all(twilioMessages)
		.then(() => {
			console.log('All messages sent successfully');
			console.log('Sending all messages via Twilio... [done]');
		})
		.catch(() => { // TODO this is never called even when some messages fail; is it because of the `catch` inside the `messages.map`?
			console.log('Some message(s) failed to send; others may have succeeded');
			console.log('Sending all messages via Twilio... [FAIL]');
		})
});
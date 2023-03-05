import { TWILIO_SID, TWILIO_TOKEN } from '../../../functions/src/config'
import { sendSms } from '../../src/utils/messaging/sms';

const itif = (condition: boolean) => (condition ? test : test.skip);

describe('send simple Sms', () => {
	console.log(TWILIO_SID);
	itif(TWILIO_SID != undefined && TWILIO_SID != 'ACXXXXXXXXXXXXXXXXXXXX')('send simple free text sms', async () => {
		let [messageSid, messageStatus, messageContent] = ['', '', ''];

		[messageSid, messageStatus, messageContent] = await sendSms({
			messageRecipientPhone: '+41767777777',
			messageContext: {
				content: 'This is a Test SMS',
			},
			smsServiceId: TWILIO_SID,
			smsServiceSecret: TWILIO_TOKEN,
			messageSenderPhone: '+15005550006',
			templateParameter: {
				language: 'de',
				templatePath: 'sms/freetext.hbs',
				translationNamespace: 'freetext.json',
			},
		});

		expect(messageStatus).toBe('queued');
		expect(messageSid.length).toBeGreaterThan(0);
	});
});

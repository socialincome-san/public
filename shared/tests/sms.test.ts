import { TWILIO_SID, TWILIO_TOKEN } from "../src/config";
import { sendSms } from "../src/utils/messaging/sms";

describe('send simple Sms', () => {
	test('send simple free text sms', async () => {

		let [messageSid, messageStatus] = ['',''];

		const statusCallbackUrl = new URL('https://test.test');

		[messageSid, messageStatus] = await sendSms({
			messageRecipientPhone:'+41767777777',
			messageContext: {
				content: "This is a Test SMS"
			},
			smsServiceId: TWILIO_SID,
			smsServiceSecret: TWILIO_TOKEN,
			statusCallbackUrl: statusCallbackUrl,
			messageSenderPhone: "+15005550006",
			templateParameter: {
				language: 'de',
				templatePath: 'sms/freetext.hbs',
				translationNamespace: "freetext.json"

			}
		});

		expect(messageStatus).toBe('queued');
		expect(messageSid.length).toBeGreaterThan(0);
	});
});
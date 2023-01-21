import { TWILIO_SID, TWILIO_TOKEN } from "../src/config";
import { sendSms } from "../src/utils/messaging/sms";
import { renderTemplate } from "../src/utils/templates";

describe('send simple Sms', () => {
	test('send simple free text sms', async () => {

		let [messageSid, messageStatus] = ['',''];

		const statusCallbackUrl = new URL('https://test.test');

		const content = await renderTemplate({
			language: 'de',
			translationNamespace: "freetext.json",
			hbsTemplatePath: 'sms/freetext.hbs',
			context: {
				content: "This a test SMS."
			},
		});

		[messageSid, messageStatus] = await sendSms({
			messageRecipientPhone:'+41767777777',
			smsServiceId: TWILIO_SID,
			smsServiceSecret: TWILIO_TOKEN,
			statusCallbackUrl: statusCallbackUrl,
			messageSenderPhone: "+15005550006",
			content: content
		});

		expect(messageStatus).toBe('queued');
		expect(messageSid.length).toBeGreaterThan(0);
	});
});
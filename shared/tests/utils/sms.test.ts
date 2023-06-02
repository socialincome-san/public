import { TWILIO_SID, TWILIO_TOKEN } from '../../../functions/src/config';
import { sendSms } from '../../src/utils/messaging/sms';

const itif = (condition: boolean) => (condition ? test : test.skip);

describe('send simple SMS', () => {
	itif(TWILIO_SID != undefined && TWILIO_SID != 'ACXXXXXXXXXXXXXXXXXXXX')('send simple free text sms', async () => {
		const message = await sendSms({
			from: '+15005550006',
			to: '+41791234567',
			twilioConfig: {
				sid: TWILIO_SID,
				token: TWILIO_TOKEN,
			},
			templateProps: {
				hbsTemplatePath: 'message/freetext.hbs',
				context: {
					content: 'This is a Test SMS',
				},
			},
		});
		expect(message.status).toBe('queued');
		expect(message.sid.length).toBeGreaterThan(0);
	});
});

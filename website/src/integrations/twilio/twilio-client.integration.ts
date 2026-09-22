import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import twilio from 'twilio';

let twilioClient: twilio.Twilio | null = null;

export const getTwilioClient = async (): Promise<ServiceResult<twilio.Twilio>> => {
	if (twilioClient) {
		return resultOk(twilioClient);
	}

	const accountSid = process.env.TWILIO_ACCOUNT_SID;
	const apiKeySid = process.env.TWILIO_API_KEY_SID;
	const apiKeySecret = process.env.TWILIO_API_KEY_SECRET;
	if (!accountSid || !apiKeySid || !apiKeySecret) {
		return resultFail('Missing Twilio environment variables');
	}
	if (!accountSid.startsWith('AC')) {
		return resultFail('Invalid TWILIO_ACCOUNT_SID format');
	}
	if (!apiKeySid.startsWith('SK')) {
		return resultFail('Invalid TWILIO_API_KEY_SID format');
	}

	try {
		twilioClient = await Promise.resolve(new twilio.Twilio(apiKeySid, apiKeySecret, { accountSid }));

		return resultOk(twilioClient);
	} catch (error) {
		console.error('Failed to initialize Twilio client', { error });

		return resultFail('Failed to initialize Twilio client');
	}
};

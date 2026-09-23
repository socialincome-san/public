import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { getTwilioClient } from './twilio-client.integration';

export const validateTwilioOtpConfiguration = async (): Promise<ServiceResult<boolean>> => {
	const serviceSidResult = getVerifyServiceSid();
	if (!serviceSidResult.success) {
		return serviceSidResult;
	}

	const clientResult = await getTwilioClient();

	return clientResult.success ? resultOk(true) : resultFail(clientResult.error);
};

export const requestTwilioOtp = async (phoneNumber: string): Promise<ServiceResult<boolean>> => {
	const serviceSidResult = getVerifyServiceSid();
	if (!serviceSidResult.success) {
		return serviceSidResult;
	}

	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		await clientResult.data.verify.v2.services(serviceSidResult.data).verifications.create({
			to: phoneNumber,
			channel: 'sms',
		});

		return resultOk(true);
	} catch (error) {
		console.error('Failed to request Twilio OTP', { error });

		return resultFail('Failed to request OTP');
	}
};

export const verifyTwilioOtp = async (phoneNumber: string, otp: string): Promise<ServiceResult<{ approved: boolean }>> => {
	const serviceSidResult = getVerifyServiceSid();
	if (!serviceSidResult.success) {
		return serviceSidResult;
	}

	const clientResult = await getTwilioClient();
	if (!clientResult.success) {
		return clientResult;
	}

	try {
		const verification = await clientResult.data.verify.v2
			.services(serviceSidResult.data)
			.verificationChecks.create({ to: phoneNumber, code: otp });

		return resultOk({ approved: verification.status === 'approved' });
	} catch (error) {
		if (hasNumericCode(error, 20404)) {
			return resultFail('Verification resource not found for the provided phone number and OTP');
		}

		console.error('Failed to verify Twilio OTP', { error });

		return resultFail('Failed to verify OTP');
	}
};

const getVerifyServiceSid = (): ServiceResult<string> => {
	const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
	if (!serviceSid) {
		return resultFail('Missing TWILIO_VERIFY_SERVICE_SID');
	}
	if (!serviceSid.startsWith('VA')) {
		return resultFail('Invalid TWILIO_VERIFY_SERVICE_SID format');
	}

	return resultOk(serviceSid);
};

const hasNumericCode = (error: unknown, expectedCode: number): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === expectedCode;

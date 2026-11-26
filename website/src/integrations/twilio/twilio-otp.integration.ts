import { resultFail, resultOk, type Result } from '@/lib/result';
import { getTwilioClient } from './twilio-client.integration';

export const validateTwilioOtpConfiguration = async (): Promise<Result<boolean>> => {
	const serviceSidResult = getVerifyServiceSid();
	if (!serviceSidResult.success) {
		return serviceSidResult;
	}

	const clientResult = await getTwilioClient();

	return clientResult.success ? resultOk(true) : clientResult;
};

export const requestTwilioOtp = async (phoneNumber: string): Promise<Result<boolean>> => {
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

		if (hasHttpStatus(error, 429)) {
			return resultFail('Too many OTP requests', 429);
		}
		if (PHONE_NUMBER_ERROR_CODES.some((code) => hasNumericCode(error, code))) {
			return resultFail('Twilio rejected the phone number', 400);
		}

		return resultFail('Failed to request OTP', 502);
	}
};

export const verifyTwilioOtp = async (phoneNumber: string, otp: string): Promise<Result<{ approved: boolean }>> => {
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

const getVerifyServiceSid = (): Result<string> => {
	const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
	if (!serviceSid) {
		return resultFail('Missing TWILIO_VERIFY_SERVICE_SID', 500);
	}
	if (!serviceSid.startsWith('VA')) {
		return resultFail('Invalid TWILIO_VERIFY_SERVICE_SID format', 500);
	}

	return resultOk(serviceSid);
};

// Twilio also answers 400 for faults on our side, so only its error code can blame the number:
// 60200 is an invalid `To` (the only parameter that varies), 60006 a well-formed number the carrier
// does not know, 60205 a landline that cannot receive SMS.
const PHONE_NUMBER_ERROR_CODES = [60200, 60006, 60205];

const hasNumericCode = (error: unknown, expectedCode: number): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === expectedCode;

const hasHttpStatus = (error: unknown, expectedStatus: number): boolean =>
	typeof error === 'object' && error !== null && 'status' in error && error.status === expectedStatus;

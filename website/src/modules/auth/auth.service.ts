import {
	createFirebaseCustomToken,
	createFirebaseUserByPhoneNumber,
	findFirebaseUserByPhoneNumber,
} from '@/integrations/firebase/firebase-auth.integration';
import {
	requestTwilioOtp,
	validateTwilioOtpConfiguration,
	verifyTwilioOtp,
} from '@/integrations/twilio/twilio-otp.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { VerifyOtpInput } from './auth.schemas';
import type { VerifyOtpResult } from './auth.types';

export const requestOtp = async (phoneNumber: string): Promise<ServiceResult<boolean>> => {
	const configurationResult = await validateTwilioOtpConfiguration();
	if (!configurationResult.success) {
		return configurationResult;
	}

	const phoneResult = normalizePhoneNumber(phoneNumber);
	if (!phoneResult.success) {
		return phoneResult;
	}

	if (shouldBypassOtp(phoneResult.data)) {
		console.info('APP REVIEW MODE: Skipping Twilio OTP send for app review phone');

		return resultOk(true);
	}

	return requestTwilioOtp(phoneResult.data);
};

export const verifyOtp = async (input: VerifyOtpInput): Promise<ServiceResult<VerifyOtpResult>> => {
	const configurationResult = await validateTwilioOtpConfiguration();
	if (!configurationResult.success) {
		return configurationResult;
	}
	if (!input.phoneNumber || !input.otp) {
		return resultFail('Phone number and OTP are required');
	}

	const phoneResult = normalizePhoneNumber(input.phoneNumber);
	if (!phoneResult.success) {
		return phoneResult;
	}

	if (!shouldBypassOtp(phoneResult.data)) {
		const verificationResult = await verifyTwilioOtp(phoneResult.data, input.otp);
		if (!verificationResult.success) {
			return verificationResult;
		}
		if (!verificationResult.data.approved) {
			return resultFail('Invalid OTP provided');
		}
	} else {
		console.info('APP REVIEW MODE: Skipping Twilio verify for app review phone');
	}

	return finalizeOtpVerification(phoneResult.data);
};

const finalizeOtpVerification = async (phoneNumber: string): Promise<ServiceResult<VerifyOtpResult>> => {
	const existingUserResult = await findFirebaseUserByPhoneNumber(phoneNumber);
	if (!existingUserResult.success) {
		return resultFail(existingUserResult.error);
	}

	const isNewUser = existingUserResult.data === null;
	const userResult = existingUserResult.data
		? resultOk(existingUserResult.data)
		: await createFirebaseUserByPhoneNumber(phoneNumber);
	if (!userResult.success) {
		return resultFail('Could not create user with given phone number');
	}

	const tokenResult = await createFirebaseCustomToken(userResult.data.uid);
	if (!tokenResult.success) {
		return resultFail('Could not create auth token for user');
	}

	return resultOk({
		customToken: tokenResult.data,
		isNewUser,
		uid: userResult.data.uid,
	});
};

const normalizePhoneNumber = (phoneNumber: string | undefined): ServiceResult<string> => {
	if (!phoneNumber) {
		return resultFail('Phone number is required');
	}

	const normalized = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
	if (!/^\+[1-9]\d{1,14}$/.test(normalized)) {
		return resultFail('Phone number must be in valid E.164 format (e.g., +12345678901)');
	}

	return resultOk(normalized);
};

const shouldBypassOtp = (phoneNumber: string): boolean => {
	const reviewPhone = process.env.APP_REVIEW_PHONE_NUMBER;

	return (
		process.env.APP_REVIEW_MODE_ENABLED === 'true' &&
		Boolean(reviewPhone) &&
		(phoneNumber === reviewPhone || `+${phoneNumber}` === reviewPhone)
	);
};

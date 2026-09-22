import {
	createFirebaseCustomToken as createFirebaseCustomTokenIntegration,
	createFirebaseSessionCookie as createFirebaseSessionCookieIntegration,
	createFirebaseSurveyUser as createFirebaseSurveyUserIntegration,
	createFirebaseUserByEmail as createFirebaseUserByEmailIntegration,
	createFirebaseUserByPhoneNumber as createFirebaseUserByPhoneNumberIntegration,
	decodeFirebaseTokenFromRequest as decodeFirebaseTokenFromRequestIntegration,
	deleteFirebaseUserByPhoneNumberIfExists as deleteFirebaseUserByPhoneNumberIfExistsIntegration,
	deleteFirebaseUserByUidIfExists as deleteFirebaseUserByUidIfExistsIntegration,
	findFirebaseUserByEmail as findFirebaseUserByEmailIntegration,
	findFirebaseUserByPhoneNumber as findFirebaseUserByPhoneNumberIntegration,
	synchronizeFirebaseSurveyUser as synchronizeFirebaseSurveyUserIntegration,
	updateFirebaseUserByPhoneNumber as updateFirebaseUserByPhoneNumberIntegration,
	updateFirebaseUserByUid as updateFirebaseUserByUidIntegration,
	verifyFirebaseAppCheckToken,
	verifyFirebaseSessionCookie as verifyFirebaseSessionCookieIntegration,
} from '@/integrations/firebase/firebase-auth.integration';
import {
	requestTwilioOtp,
	validateTwilioOtpConfiguration,
	verifyTwilioOtp,
} from '@/integrations/twilio/twilio-otp.integration';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import type { VerifyOtpInput } from './auth.schemas';
import type { AuthToken, AuthUser, AuthUserUpdate, SessionCookie, VerifyOtpResult } from './auth.types';

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

export const createFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<ServiceResult<AuthUser>> =>
	createFirebaseUserByPhoneNumberIntegration(phoneNumber);

export const updateFirebaseUserByPhoneNumber = async (
	oldPhoneNumber: string,
	newPhoneNumber: string,
): Promise<ServiceResult<AuthUser>> => updateFirebaseUserByPhoneNumberIntegration(oldPhoneNumber, newPhoneNumber);

export const deleteFirebaseUserByPhoneNumberIfExists = async (phoneNumber: string): Promise<ServiceResult<boolean>> =>
	deleteFirebaseUserByPhoneNumberIfExistsIntegration(phoneNumber);

export const findFirebaseUserByEmail = async (email: string): Promise<ServiceResult<AuthUser | null>> =>
	findFirebaseUserByEmailIntegration(email);

export const createFirebaseUserByEmail = async (input: {
	email: string;
	displayName: string;
}): Promise<ServiceResult<AuthUser>> => createFirebaseUserByEmailIntegration(input);

export const createFirebaseSurveyUser = async (email: string, password: string): Promise<ServiceResult<{ uid: string }>> =>
	createFirebaseSurveyUserIntegration(email, password);

export const synchronizeFirebaseSurveyUser = async (input: {
	nextEmail: string;
	nextPassword: string;
	previousEmail?: string;
}): Promise<ServiceResult<void>> => synchronizeFirebaseSurveyUserIntegration(input);

export const updateFirebaseUserByUid = async (uid: string, updates: AuthUserUpdate): Promise<ServiceResult<AuthUser>> =>
	updateFirebaseUserByUidIntegration(uid, updates);

export const deleteFirebaseUserByUidIfExists = async (uid: string): Promise<ServiceResult<boolean>> =>
	deleteFirebaseUserByUidIfExistsIntegration(uid);

export const deleteFirebaseUserByEmailIfExists = async (email: string): Promise<ServiceResult<boolean>> => {
	const existingUserResult = await findFirebaseUserByEmail(email);
	if (!existingUserResult.success) {
		return resultFail(existingUserResult.error);
	}
	if (!existingUserResult.data) {
		return resultOk(true);
	}

	return deleteFirebaseUserByUidIfExists(existingUserResult.data.uid);
};

export const decodeFirebaseTokenFromRequest = async (request: Request): Promise<ServiceResult<AuthToken>> =>
	decodeFirebaseTokenFromRequestIntegration(request);

export const getPhoneNumberFromFirebaseToken = (decodedToken: AuthToken): ServiceResult<string | null> =>
	resultOk(decodedToken.phoneNumber);

export const createSessionCookie = async (idToken: string): Promise<ServiceResult<SessionCookie>> => {
	if (!idToken) {
		return resultFail('missing-id-token');
	}

	const sessionCookieResult = await createFirebaseSessionCookieIntegration(idToken, SESSION_EXPIRES_IN_MS);
	if (!sessionCookieResult.success) {
		return resultFail(sessionCookieResult.error);
	}

	const verifiedResult = await verifyFirebaseSessionCookieIntegration(sessionCookieResult.data);
	if (!verifiedResult.success) {
		return resultFail('invalid-token');
	}

	return resultOk({
		value: sessionCookieResult.data,
		maxAge: Math.floor(SESSION_EXPIRES_IN_MS / 1000),
	});
};

export const verifySessionCookie = async (sessionCookie: string): Promise<ServiceResult<AuthToken>> =>
	verifyFirebaseSessionCookieIntegration(sessionCookie);

export const verifyAppCheckFromRequest = async (request: Request): Promise<ServiceResult<boolean>> => {
	const token = request.headers.get('X-Firebase-AppCheck');
	if (!token) {
		console.warn('App Check failed: missing token', {
			path: request.url,
			userAgent: request.headers.get('user-agent'),
		});

		return resultFail('missing-app-check-token', 401);
	}

	const verificationResult = await verifyFirebaseAppCheckToken(token);
	if (!verificationResult.success) {
		console.warn('App Check failed: invalid token', {
			path: request.url,
			userAgent: request.headers.get('user-agent'),
		});

		return resultFail(verificationResult.error, verificationResult.status);
	}

	console.info('App Check passed', {
		appId: verificationResult.data.appId,
		path: request.url,
	});

	return resultOk(true);
};

const finalizeOtpVerification = async (phoneNumber: string): Promise<ServiceResult<VerifyOtpResult>> => {
	const existingUserResult = await findFirebaseUserByPhoneNumber(phoneNumber);
	if (!existingUserResult.success) {
		return resultFail(existingUserResult.error);
	}

	const isNewUser = existingUserResult.data === null;
	const userResult = existingUserResult.data
		? resultOk(existingUserResult.data)
		: await createFirebaseUserByPhoneNumberIntegration(phoneNumber);
	if (!userResult.success) {
		return resultFail('Could not create user with given phone number');
	}

	const tokenResult = await createFirebaseCustomTokenIntegration(userResult.data.uid);
	if (!tokenResult.success) {
		return resultFail('Could not create auth token for user');
	}

	return resultOk({
		customToken: tokenResult.data,
		isNewUser,
		uid: userResult.data.uid,
	});
};

const findFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<ServiceResult<AuthUser | null>> =>
	findFirebaseUserByPhoneNumberIntegration(phoneNumber);

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

const SESSION_MAX_AGE_DAYS = 7;
const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

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
	generateFirebaseSignInLink,
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
import { loadMessages } from '@/lib/i18n/messages';
import { getWebsiteBasePath, parseCurrencySegment, TIME_ZONE, type WebsiteLanguage } from '@/lib/i18n/utils';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { archiveSentEmail, sendMail } from '@/modules/mail/mail.service';
import { createTranslator } from 'next-intl';
import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import type { VerifyOtpInput } from './auth.schemas';
import { websiteLocaleSchema } from './auth.schemas';
import type { AuthToken, AuthUser, AuthUserUpdate, SessionCookie, VerifyOtpResult } from './auth.types';
import { deleteExpiredMagicLinkRateLimits, updateMagicLinkRateLimitCount } from './magic-link-rate-limit.repository';

const magicLinkWindowMs = 15 * 60 * 1000;
const magicLinkEmailLimit = 3;
const magicLinkIpLimit = 20;
const magicLinkRateLimitRetentionMs = 24 * 60 * 60 * 1000;

export const requestOtp = async (phoneNumber: string): Promise<Result<boolean>> => {
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

export const sendMagicLoginLink = async (input: {
	email: string;
	continueUrl: string;
	requestOrigin: string;
	requesterIp?: string;
}): Promise<Result<void>> => {
	const continueUrlResult = validateMagicLoginContinueUrl(input.email, input.continueUrl, input.requestOrigin);
	if (!continueUrlResult.success) {
		return resultFail(continueUrlResult.error);
	}

	const templateId = process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID?.trim();
	const rateLimitSecret = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
	if (!templateId || !rateLimitSecret) {
		console.error('Magic-link email configuration is incomplete');

		return resultFail('Could not send sign-in link');
	}

	try {
		const now = new Date();
		await deleteExpiredMagicLinkRateLimits(new Date(now.getTime() - magicLinkRateLimitRetentionMs));

		const emailKey = hashMagicLinkRateLimitKey(rateLimitSecret, `email:${input.email.toLowerCase()}`);
		const ipKey =
			input.requesterIp && isIP(input.requesterIp)
				? hashMagicLinkRateLimitKey(rateLimitSecret, `ip:${input.requesterIp}`)
				: undefined;
		const [emailRequestCount, ipRequestCount] = await Promise.all([
			updateMagicLinkRateLimitCount(emailKey, now, magicLinkWindowMs),
			ipKey ? updateMagicLinkRateLimitCount(ipKey, now, magicLinkWindowMs) : Promise.resolve(0),
		]);
		if (emailRequestCount > magicLinkEmailLimit || ipRequestCount > magicLinkIpLimit) {
			return resultOk(undefined);
		}

		const signInLinkResult = await generateFirebaseSignInLink(input.email, input.continueUrl);
		if (!signInLinkResult.success) {
			console.error('Could not complete Firebase magic-link generation');

			return resultFail('Could not send sign-in link');
		}

		const messages = await loadMessages(continueUrlResult.data.language);
		const t = createTranslator({
			locale: continueUrlResult.data.language,
			messages,
			namespace: 'website-login',
			timeZone: TIME_ZONE,
		});
		const emailResult = await sendMail({
			to: input.email,
			subject: t('magic-link-email.subject'),
			text: t('magic-link-email.archive'),
			template: {
				id: templateId,
				data: {
					logoUrl: new URL('/assets/logos_si/logo_color@2x.png', continueUrlResult.data.origin).toString(),
					subject: t('magic-link-email.subject'),
					previewText: t('magic-link-email.preview-text'),
					heading: t('magic-link-email.heading'),
					body: t('magic-link-email.body'),
					buttonText: t('magic-link-email.button'),
					magicLink: signInLinkResult.data,
					securityNotice: t('magic-link-email.security-notice'),
					ignoreNotice: t('magic-link-email.ignore-notice'),
					footer: t('magic-link-email.footer'),
				},
			},
			sensitive: true,
		});
		if (!emailResult.success) {
			console.error('Could not deliver Firebase magic-link email');

			return resultFail('Could not send sign-in link');
		}

		return resultOk(undefined);
	} catch {
		console.error('Could not process Firebase magic-link request');

		return resultFail('Could not send sign-in link');
	}
};

export const archiveEmulatorMagicLoginEmail = async (input: {
	email: string;
	continueUrl: string;
	requestOrigin: string;
}): Promise<Result<void>> => {
	if (!process.env.FIREBASE_AUTH_EMULATOR_HOST || !process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL) {
		return resultFail('Firebase Auth emulator is not enabled');
	}

	const continueUrlResult = validateMagicLoginContinueUrl(input.email, input.continueUrl, input.requestOrigin);
	if (!continueUrlResult.success) {
		return resultFail(continueUrlResult.error);
	}

	try {
		const messages = await loadMessages(continueUrlResult.data.language);
		const t = createTranslator({
			locale: continueUrlResult.data.language,
			messages,
			namespace: 'website-login',
			timeZone: TIME_ZONE,
		});
		const archiveResult = await archiveSentEmail({
			to: input.email,
			subject: t('magic-link-email.subject'),
			text: t('magic-link-email.archive'),
		});
		if (!archiveResult.success) {
			console.error('Could not archive Firebase emulator sign-in email');

			return resultFail('Could not archive sign-in email');
		}

		return resultOk(undefined);
	} catch {
		console.error('Could not prepare Firebase emulator sign-in archive');

		return resultFail('Could not archive sign-in email');
	}
};

export const validateMagicLoginContinueUrl = (
	email: string,
	continueUrl: string,
	requestOrigin: string,
): Result<{ language: WebsiteLanguage; origin: string }> => {
	try {
		if (continueUrl.length > 2048) {
			return resultFail('Invalid sign-in continue URL');
		}

		const url = new URL(continueUrl);
		const origin = new URL(requestOrigin);
		const isLocalAuthEmulatorOrigin =
			Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST?.trim()) &&
			Boolean(process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL?.trim()) &&
			(origin.hostname === 'localhost' ||
				origin.hostname === '[::1]' ||
				(isIP(origin.hostname) === 4 && origin.hostname.split('.')[0] === '127'));
		if (
			(url.protocol !== 'https:' && url.protocol !== 'http:') ||
			url.origin !== origin.origin ||
			url.username ||
			url.password ||
			url.hash ||
			(process.env.NODE_ENV === 'production' && url.protocol !== 'https:' && !isLocalAuthEmulatorOrigin)
		) {
			return resultFail('Invalid sign-in continue URL');
		}

		const pathMatch = /^\/([^/]+)\/([^/]+)\/auth\/confirm-login$/.exec(url.pathname);
		if (!pathMatch) {
			return resultFail('Invalid sign-in continue URL');
		}

		const currency = parseCurrencySegment(pathMatch[2]);
		const localeResult = websiteLocaleSchema.safeParse({ lang: pathMatch[1], currency });
		if (
			!localeResult.success ||
			url.pathname !== `${getWebsiteBasePath(localeResult.data.lang, localeResult.data.currency)}/auth/confirm-login`
		) {
			return resultFail('Invalid sign-in continue URL');
		}

		const emailParameters = url.searchParams.getAll('email');
		const campaignParameters = url.searchParams.getAll('campaigns');
		if (
			emailParameters.length !== 1 ||
			emailParameters[0] !== email ||
			campaignParameters.length > 1 ||
			Array.from(url.searchParams.keys()).some((key) => key !== 'email' && key !== 'campaigns')
		) {
			return resultFail('Invalid sign-in continue URL');
		}

		if (campaignParameters.length === 1) {
			const claimIds = campaignParameters[0].split(',');
			if (claimIds.some((claimId) => !/^[A-Za-z0-9]{8}$/.test(claimId)) || new Set(claimIds).size !== claimIds.length) {
				return resultFail('Invalid sign-in continue URL');
			}
		}

		return resultOk({ language: localeResult.data.lang, origin: origin.origin });
	} catch {
		return resultFail('Invalid sign-in continue URL');
	}
};

const hashMagicLinkRateLimitKey = (secret: string, value: string): string =>
	createHmac('sha256', secret).update(value).digest('hex');

export const verifyOtp = async (input: VerifyOtpInput): Promise<Result<VerifyOtpResult>> => {
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

export const createFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<Result<AuthUser>> =>
	createFirebaseUserByPhoneNumberIntegration(phoneNumber);

export const updateFirebaseUserByPhoneNumber = async (
	oldPhoneNumber: string,
	newPhoneNumber: string,
): Promise<Result<AuthUser>> => updateFirebaseUserByPhoneNumberIntegration(oldPhoneNumber, newPhoneNumber);

export const deleteFirebaseUserByPhoneNumberIfExists = async (phoneNumber: string): Promise<Result<boolean>> =>
	deleteFirebaseUserByPhoneNumberIfExistsIntegration(phoneNumber);

export const findFirebaseUserByEmail = async (email: string): Promise<Result<AuthUser | null>> =>
	findFirebaseUserByEmailIntegration(email);

export const createFirebaseUserByEmail = async (input: { email: string; displayName: string }): Promise<Result<AuthUser>> =>
	createFirebaseUserByEmailIntegration(input);

export const createFirebaseSurveyUser = async (email: string, password: string): Promise<Result<{ uid: string }>> =>
	createFirebaseSurveyUserIntegration(email, password);

export const synchronizeFirebaseSurveyUser = async (input: {
	nextEmail: string;
	nextPassword: string;
	previousEmail?: string;
}): Promise<Result<void>> => synchronizeFirebaseSurveyUserIntegration(input);

export const updateFirebaseUserByUid = async (uid: string, updates: AuthUserUpdate): Promise<Result<AuthUser>> =>
	updateFirebaseUserByUidIntegration(uid, updates);

export const deleteFirebaseUserByUidIfExists = async (uid: string): Promise<Result<boolean>> =>
	deleteFirebaseUserByUidIfExistsIntegration(uid);

export const deleteFirebaseUserByEmailIfExists = async (email: string): Promise<Result<boolean>> => {
	const existingUserResult = await findFirebaseUserByEmail(email);
	if (!existingUserResult.success) {
		return resultFail(existingUserResult.error);
	}
	if (!existingUserResult.data) {
		return resultOk(true);
	}

	return deleteFirebaseUserByUidIfExists(existingUserResult.data.uid);
};

export const decodeFirebaseTokenFromRequest = async (request: Request): Promise<Result<AuthToken>> =>
	decodeFirebaseTokenFromRequestIntegration(request);

export const getPhoneNumberFromFirebaseToken = (decodedToken: AuthToken): Result<string | null> =>
	resultOk(decodedToken.phoneNumber);

export const createSessionCookie = async (idToken: string): Promise<Result<SessionCookie>> => {
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

export const verifySessionCookie = async (sessionCookie: string): Promise<Result<AuthToken>> =>
	verifyFirebaseSessionCookieIntegration(sessionCookie);

export const verifyAppCheckFromRequest = async (request: Request): Promise<Result<boolean>> => {
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

const finalizeOtpVerification = async (phoneNumber: string): Promise<Result<VerifyOtpResult>> => {
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

const findFirebaseUserByPhoneNumber = async (phoneNumber: string): Promise<Result<AuthUser | null>> =>
	findFirebaseUserByPhoneNumberIntegration(phoneNumber);

const normalizePhoneNumber = (phoneNumber: string | undefined): Result<string> => {
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

import { resultFail, resultOk } from '@/lib/result';
import {
	archiveEmulatorMagicLoginEmail,
	createSessionCookie,
	requestOtp,
	sendMagicLoginLink,
	validateMagicLoginContinueUrl,
	verifyOtp,
	verifySessionCookie,
} from './auth.service';

const mockValidateConfiguration = jest.fn();
const mockRequestTwilioOtp = jest.fn();
const mockVerifyTwilioOtp = jest.fn();
const mockFindFirebaseUser = jest.fn();
const mockCreateFirebaseUser = jest.fn();
const mockCreateFirebaseToken = jest.fn();
const mockCreateFirebaseSessionCookie = jest.fn();
const mockVerifyFirebaseSessionCookie = jest.fn();
const mockGenerateFirebaseSignInLink = jest.fn();
const mockDeleteExpiredMagicLinkRateLimits = jest.fn();
const mockIncrementMagicLinkRateLimit = jest.fn();
const mockSendMail = jest.fn();
const mockArchiveSentEmail = jest.fn();
const originalMagicLinkTemplateId = process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID;
const originalFirebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const originalFirebaseAuthEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const originalPublicFirebaseAuthEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

jest.mock('next/headers', () => {
	throw new Error('Auth services must not import Next.js request boundaries');
});

jest.mock('@/integrations/twilio/twilio-otp.integration', () => ({
	validateTwilioOtpConfiguration: (...args: unknown[]): unknown => mockValidateConfiguration(...args),
	requestTwilioOtp: (...args: unknown[]): unknown => mockRequestTwilioOtp(...args),
	verifyTwilioOtp: (...args: unknown[]): unknown => mockVerifyTwilioOtp(...args),
}));

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({
	findFirebaseUserByPhoneNumber: (...args: unknown[]): unknown => mockFindFirebaseUser(...args),
	createFirebaseUserByPhoneNumber: (...args: unknown[]): unknown => mockCreateFirebaseUser(...args),
	createFirebaseCustomToken: (...args: unknown[]): unknown => mockCreateFirebaseToken(...args),
	createFirebaseSessionCookie: (...args: unknown[]): unknown => mockCreateFirebaseSessionCookie(...args),
	generateFirebaseSignInLink: (...args: unknown[]): unknown => mockGenerateFirebaseSignInLink(...args),
	verifyFirebaseSessionCookie: (...args: unknown[]): unknown => mockVerifyFirebaseSessionCookie(...args),
}));

jest.mock('@/modules/mail/mail.service', () => ({
	archiveSentEmail: (...args: unknown[]): unknown => mockArchiveSentEmail(...args),
	sendMail: (...args: unknown[]): unknown => mockSendMail(...args),
}));

jest.mock('./magic-link-rate-limit.repository', () => ({
	deleteExpiredMagicLinkRateLimits: (...args: unknown[]): unknown => mockDeleteExpiredMagicLinkRateLimits(...args),
	updateMagicLinkRateLimitCount: (...args: unknown[]): unknown => mockIncrementMagicLinkRateLimit(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	delete process.env.APP_REVIEW_MODE_ENABLED;
	delete process.env.APP_REVIEW_PHONE_NUMBER;
	mockValidateConfiguration.mockResolvedValue(resultOk(true));
	mockGenerateFirebaseSignInLink.mockResolvedValue(resultOk('https://example.org/?oobCode=one-time-token'));
	mockDeleteExpiredMagicLinkRateLimits.mockResolvedValue({ count: 0 });
	mockIncrementMagicLinkRateLimit.mockResolvedValue(1);
	mockSendMail.mockResolvedValue(resultOk(undefined));
	mockArchiveSentEmail.mockResolvedValue(resultOk(undefined));
	process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID = 'd-login-template';
	process.env.FIREBASE_SERVICE_ACCOUNT_JSON = 'test-service-account-secret';
	process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
	process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL = 'http://127.0.0.1:9099';
});

afterEach(() => {
	if (originalMagicLinkTemplateId === undefined) {
		delete process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID;
	} else {
		process.env.SENDGRID_MAGIC_LOGIN_TEMPLATE_ID = originalMagicLinkTemplateId;
	}
	if (originalFirebaseServiceAccount === undefined) {
		delete process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
	} else {
		process.env.FIREBASE_SERVICE_ACCOUNT_JSON = originalFirebaseServiceAccount;
	}
	if (originalFirebaseAuthEmulatorHost === undefined) {
		delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
	} else {
		process.env.FIREBASE_AUTH_EMULATOR_HOST = originalFirebaseAuthEmulatorHost;
	}
	if (originalPublicFirebaseAuthEmulatorUrl === undefined) {
		delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
	} else {
		process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL = originalPublicFirebaseAuthEmulatorUrl;
	}
	jest.restoreAllMocks();
});

test('validates a cross-browser continue URL while preserving email and campaign claims', () => {
	const continueUrl =
		'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=Ab12Cd34%2CXy98Zk76';

	expect(validateMagicLoginContinueUrl('ada@example.com', continueUrl, 'https://socialincome.org')).toEqual(
		resultOk({ language: 'de', origin: 'https://socialincome.org' }),
	);
});

test('allows localhost HTTP for Firebase emulator sign-in in a production build', () => {
	jest.replaceProperty(process.env, 'NODE_ENV', 'production');
	const continueUrl = 'http://localhost:3000/en/usd/auth/confirm-login?email=ada%40example.com';

	expect(validateMagicLoginContinueUrl('ada@example.com', continueUrl, 'http://localhost:3000')).toEqual(
		resultOk({ language: 'en', origin: 'http://localhost:3000' }),
	);
});

test('still requires HTTPS for non-local origins in a production build with the emulator configured', () => {
	jest.replaceProperty(process.env, 'NODE_ENV', 'production');
	const continueUrl = 'http://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com';

	expect(validateMagicLoginContinueUrl('ada@example.com', continueUrl, 'http://socialincome.org')).toEqual(
		resultFail('Invalid sign-in continue URL'),
	);
});

test.each([
	['https://attacker.example/de/chf/auth/confirm-login?email=ada%40example.com', 'https://socialincome.org'],
	['https://socialincome.org/de/chf/auth/confirm-login?email=other%40example.com', 'https://socialincome.org'],
	[
		'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=not-a-claim',
		'https://socialincome.org',
	],
])('rejects unsafe magic-link continue URLs', (continueUrl, origin) => {
	expect(validateMagicLoginContinueUrl('ada@example.com', continueUrl, origin)).toEqual(
		resultFail('Invalid sign-in continue URL'),
	);
});

test('sends a localized SendGrid template with a safe archived body and rate-limited identifiers', async () => {
	const continueUrl = 'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com&campaigns=Ab12Cd34';
	const result = await sendMagicLoginLink({
		email: 'ada@example.com',
		continueUrl,
		requestOrigin: 'https://socialincome.org',
		requesterIp: '203.0.113.12',
	});

	expect(result).toEqual(resultOk(undefined));
	expect(mockGenerateFirebaseSignInLink).toHaveBeenCalledWith('ada@example.com', continueUrl);
	expect(mockDeleteExpiredMagicLinkRateLimits).toHaveBeenCalledTimes(1);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(
		1,
		expect.stringMatching(/^[a-f0-9]{64}$/),
		expect.any(Date),
		expect.any(Number),
	);
	expect(mockIncrementMagicLinkRateLimit).toHaveBeenNthCalledWith(
		2,
		expect.stringMatching(/^[a-f0-9]{64}$/),
		expect.any(Date),
		expect.any(Number),
	);
	expect(mockSendMail).toHaveBeenCalledWith(
		expect.objectContaining({
			to: 'ada@example.com',
			subject: 'Dein Anmeldelink für Social Income',
			text: 'Eine Anmelde-E-Mail wurde versendet. Der einmalige Link ist in diesem Archiv [REDACTED].',
			sensitive: true,
			template: {
				id: 'd-login-template',
				data: {
					subject: 'Dein Anmeldelink für Social Income',
					logoUrl: 'https://socialincome.org/assets/logos_si/logo_color@2x.png',
					previewText: 'Mit diesem einmaligen Link kannst du dich bei Social Income anmelden.',
					heading: 'Bei Social Income anmelden',
					body: 'Klicke unten, um dich sicher bei deinem Social-Income-Konto anzumelden.',
					buttonText: 'Anmelden',
					magicLink: 'https://example.org/?oobCode=one-time-token',
					securityNotice: 'Zu deiner Sicherheit kann dieser Link nur einmal verwendet werden.',
					ignoreNotice: 'Wenn du diese E-Mail nicht angefordert hast, kannst du sie einfach ignorieren.',
					footer: 'Social Income · Bedingungsloses Grundeinkommen',
				},
			},
		}),
	);
});

test('does not generate or send links after the email or IP request limit is exceeded', async () => {
	mockIncrementMagicLinkRateLimit.mockResolvedValueOnce(4).mockResolvedValueOnce(1);

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
			requesterIp: '203.0.113.12',
		}),
	).resolves.toEqual(resultOk(undefined));

	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
	expect(mockSendMail).not.toHaveBeenCalled();
});

test('applies the per-IP limit even when requests target different email addresses', async () => {
	mockIncrementMagicLinkRateLimit.mockResolvedValueOnce(1).mockResolvedValueOnce(21);

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
			requesterIp: '203.0.113.12',
		}),
	).resolves.toEqual(resultOk(undefined));

	expect(mockIncrementMagicLinkRateLimit).toHaveBeenCalledTimes(2);
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
	expect(mockSendMail).not.toHaveBeenCalled();
});

test('archives a safe localized body for Firebase emulator delivery', async () => {
	await expect(
		archiveEmulatorMagicLoginEmail({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/de/chf/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
		}),
	).resolves.toEqual(resultOk(undefined));

	expect(mockArchiveSentEmail).toHaveBeenCalledWith({
		to: 'ada@example.com',
		subject: 'Dein Anmeldelink für Social Income',
		text: 'Eine Anmelde-E-Mail wurde versendet. Der einmalige Link ist in diesem Archiv [REDACTED].',
	});
	expect(mockSendMail).not.toHaveBeenCalled();
	expect(mockGenerateFirebaseSignInLink).not.toHaveBeenCalled();
});

test('does not archive sign-in email when the client auth emulator is not configured', async () => {
	delete process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;

	await expect(
		archiveEmulatorMagicLoginEmail({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
		}),
	).resolves.toEqual(resultFail('Firebase Auth emulator is not enabled'));

	expect(mockArchiveSentEmail).not.toHaveBeenCalled();
});

test('does not log a failed SendGrid delivery with the generated sign-in link', async () => {
	const signInLink = 'https://example.org/?oobCode=one-time-token';
	const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
	mockSendMail.mockResolvedValue(resultFail('Could not send email'));

	await expect(
		sendMagicLoginLink({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
			requestOrigin: 'https://socialincome.org',
		}),
	).resolves.toEqual(resultFail('Could not send sign-in link'));

	expect(consoleError.mock.calls.flat().join(' ')).not.toContain(signInLink);
	consoleError.mockRestore();
});

test('normalizes and requests a Twilio OTP', async () => {
	mockRequestTwilioOtp.mockResolvedValue(resultOk(true));

	expect(await requestOtp('41791234567')).toEqual(resultOk(true));
	expect(mockRequestTwilioOtp).toHaveBeenCalledWith('+41791234567');
});

test('app review mode bypasses Twilio while retaining configuration validation', async () => {
	process.env.APP_REVIEW_MODE_ENABLED = 'true';
	process.env.APP_REVIEW_PHONE_NUMBER = '+41791234567';

	expect(await requestOtp('+41791234567')).toEqual(resultOk(true));
	expect(mockValidateConfiguration).toHaveBeenCalledTimes(1);
	expect(mockRequestTwilioOtp).not.toHaveBeenCalled();
});

test('verifies OTP and returns a Firebase custom token for an existing user', async () => {
	mockVerifyTwilioOtp.mockResolvedValue(resultOk({ approved: true }));
	mockFindFirebaseUser.mockResolvedValue(resultOk({ uid: 'uid1' }));
	mockCreateFirebaseToken.mockResolvedValue(resultOk('token1'));

	expect(await verifyOtp({ phoneNumber: '+41791234567', otp: '123456' })).toEqual(
		resultOk({ customToken: 'token1', isNewUser: false, uid: 'uid1' }),
	);
});

test('rejects an unapproved OTP without creating an auth user', async () => {
	mockVerifyTwilioOtp.mockResolvedValue(resultOk({ approved: false }));

	expect(await verifyOtp({ phoneNumber: '+41791234567', otp: '000000' })).toEqual({
		success: false,
		error: 'Invalid OTP provided',
	});
	expect(mockCreateFirebaseUser).not.toHaveBeenCalled();
});

test('creates and validates a seven-day Firebase session cookie value', async () => {
	const authToken = { uid: 'uid1', email: 'user@example.org', phoneNumber: null };
	mockCreateFirebaseSessionCookie.mockResolvedValue(resultOk('session-cookie'));
	mockVerifyFirebaseSessionCookie.mockResolvedValue(resultOk(authToken));

	expect(await createSessionCookie('id-token')).toEqual(
		resultOk({
			value: 'session-cookie',
			maxAge: 7 * 24 * 60 * 60,
		}),
	);
	expect(mockCreateFirebaseSessionCookie).toHaveBeenCalledWith('id-token', 7 * 24 * 60 * 60 * 1000);
	expect(mockVerifyFirebaseSessionCookie).toHaveBeenCalledWith('session-cookie');
});

test('rejects a session cookie value that cannot be verified', async () => {
	mockCreateFirebaseSessionCookie.mockResolvedValue(resultOk('session-cookie'));
	mockVerifyFirebaseSessionCookie.mockResolvedValue(resultFail('Invalid or expired session cookie'));

	expect(await createSessionCookie('id-token')).toEqual(resultFail('invalid-token'));
});

test('verifies an existing Firebase session cookie value', async () => {
	const authToken = { uid: 'uid1', email: null, phoneNumber: '+41791234567' };
	mockVerifyFirebaseSessionCookie.mockResolvedValue(resultOk(authToken));

	expect(await verifySessionCookie('session-cookie')).toEqual(resultOk(authToken));
	expect(mockVerifyFirebaseSessionCookie).toHaveBeenCalledWith('session-cookie');
});

import { resultFail, resultOk } from '@/lib/service-result';
import { createSessionCookie, requestOtp, verifyOtp, verifySessionCookie } from './auth.service';

const mockValidateConfiguration = jest.fn();
const mockRequestTwilioOtp = jest.fn();
const mockVerifyTwilioOtp = jest.fn();
const mockFindFirebaseUser = jest.fn();
const mockCreateFirebaseUser = jest.fn();
const mockCreateFirebaseToken = jest.fn();
const mockCreateFirebaseSessionCookie = jest.fn();
const mockVerifyFirebaseSessionCookie = jest.fn();

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
	verifyFirebaseSessionCookie: (...args: unknown[]): unknown => mockVerifyFirebaseSessionCookie(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	delete process.env.APP_REVIEW_MODE_ENABLED;
	delete process.env.APP_REVIEW_PHONE_NUMBER;
	mockValidateConfiguration.mockResolvedValue(resultOk(true));
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

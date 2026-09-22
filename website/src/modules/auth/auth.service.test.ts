import { resultOk } from '@/lib/service-result';
import { requestOtp, verifyOtp } from './auth.service';

const mockValidateConfiguration = jest.fn();
const mockRequestTwilioOtp = jest.fn();
const mockVerifyTwilioOtp = jest.fn();
const mockFindFirebaseUser = jest.fn();
const mockCreateFirebaseUser = jest.fn();
const mockCreateFirebaseToken = jest.fn();

jest.mock('@/integrations/twilio/twilio-otp.integration', () => ({
	validateTwilioOtpConfiguration: (...args: unknown[]): unknown => mockValidateConfiguration(...args),
	requestTwilioOtp: (...args: unknown[]): unknown => mockRequestTwilioOtp(...args),
	verifyTwilioOtp: (...args: unknown[]): unknown => mockVerifyTwilioOtp(...args),
}));

jest.mock('@/integrations/firebase/firebase-auth.integration', () => ({
	findFirebaseUserByPhoneNumber: (...args: unknown[]): unknown => mockFindFirebaseUser(...args),
	createFirebaseUserByPhoneNumber: (...args: unknown[]): unknown => mockCreateFirebaseUser(...args),
	createFirebaseCustomToken: (...args: unknown[]): unknown => mockCreateFirebaseToken(...args),
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

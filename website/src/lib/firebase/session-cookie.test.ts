import { resultFail, resultOk } from '@/lib/service-result';
import { getCurrentAuthToken } from './session-cookie';

const mockCookies = jest.fn();
const mockVerifySessionCookie = jest.fn();

jest.mock('next/headers', () => ({
	cookies: (...args: unknown[]): unknown => mockCookies(...args),
}));

jest.mock('@/modules/auth/auth.service', () => ({
	verifySessionCookie: (...args: unknown[]): unknown => mockVerifySessionCookie(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
});

test('reads and verifies the current session cookie', async () => {
	const authToken = { uid: 'uid1', email: 'user@example.org', phoneNumber: null };
	mockCookies.mockResolvedValue({
		get: jest.fn().mockReturnValue({ value: 'session-cookie' }),
	});
	mockVerifySessionCookie.mockResolvedValue(resultOk(authToken));

	expect(await getCurrentAuthToken()).toEqual(resultOk(authToken));
	expect(mockVerifySessionCookie).toHaveBeenCalledWith('session-cookie');
});

test('returns an authentication failure when the session cookie is missing', async () => {
	mockCookies.mockResolvedValue({
		get: jest.fn().mockReturnValue(undefined),
	});

	expect(await getCurrentAuthToken()).toEqual(resultFail('Missing session cookie'));
	expect(mockVerifySessionCookie).not.toHaveBeenCalled();
});

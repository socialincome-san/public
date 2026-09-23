import { resultOk } from '@/lib/service-result';
import { createSessionAction, logoutAction } from './auth.actions';

const mockCookies = jest.fn();
const mockSetCookie = jest.fn();
const mockCreateSessionCookie = jest.fn();

jest.mock('next/headers', () => ({
	cookies: (...args: unknown[]): unknown => mockCookies(...args),
}));

jest.mock('@/lib/firebase/current-account', () => ({
	getCurrentSessions: jest.fn(),
	getSessionByType: jest.fn(),
}));

jest.mock('./auth.service', () => ({
	createSessionCookie: (...args: unknown[]): unknown => mockCreateSessionCookie(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockCookies.mockResolvedValue({ set: mockSetCookie });
});

test('creates a session and sets the HTTP cookie at the action boundary', async () => {
	mockCreateSessionCookie.mockResolvedValue(
		resultOk({
			value: 'session-cookie',
			maxAge: 7 * 24 * 60 * 60,
		}),
	);

	expect(await createSessionAction('id-token')).toEqual(resultOk(true));
	expect(mockCreateSessionCookie).toHaveBeenCalledWith('id-token');
	expect(mockSetCookie).toHaveBeenCalledWith({
		name: 'session',
		value: 'session-cookie',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		path: '/',
		maxAge: 7 * 24 * 60 * 60,
	});
});

test('logout clears the HTTP cookie at the action boundary', async () => {
	expect(await logoutAction()).toEqual(resultOk(true));
	expect(mockSetCookie).toHaveBeenCalledWith({
		name: 'session',
		value: '',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
});

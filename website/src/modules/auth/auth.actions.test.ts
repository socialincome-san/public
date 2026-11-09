import { resultOk } from '@/lib/result';
import { createSessionAction, logoutAction } from './auth.actions';

const mockCookies = jest.fn();
const mockSetCookie = jest.fn();
const mockCreateSessionCookie = jest.fn();
const mockGetCurrentUser = jest.fn();

jest.mock('next/headers', () => ({
	cookies: (...args: unknown[]): unknown => mockCookies(...args),
}));

jest.mock('@/modules/auth/session.service', () => ({
	getCurrentSessions: jest.fn(),
	getCurrentUser: (...args: unknown[]): unknown => mockGetCurrentUser(...args),
	getSessionByType: jest.fn(),
}));

jest.mock('./auth.service', () => ({
	createSessionCookie: (...args: unknown[]): unknown => mockCreateSessionCookie(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockCookies.mockResolvedValue({ set: mockSetCookie });
	mockGetCurrentUser.mockResolvedValue(resultOk(null));
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
	expect(mockSetCookie).toHaveBeenCalledWith({
		name: 'portal-language',
		value: 'en',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		path: '/',
	});
});

test('uses the signed-in user language for the portal cookie', async () => {
	mockCreateSessionCookie.mockResolvedValue(
		resultOk({
			value: 'session-cookie',
			maxAge: 7 * 24 * 60 * 60,
		}),
	);
	mockGetCurrentUser.mockResolvedValue(resultOk({ language: 'fr' }));

	expect(await createSessionAction('id-token')).toEqual(resultOk(true));
	expect(mockSetCookie).toHaveBeenCalledWith(expect.objectContaining({ name: 'portal-language', value: 'fr' }));
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
	expect(mockSetCookie).toHaveBeenCalledWith({
		name: 'portal-language',
		value: '',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		path: '/',
		maxAge: 0,
	});
});

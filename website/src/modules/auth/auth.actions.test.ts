import { resultFail, resultOk } from '@/lib/result';
import { createSessionAction, logoutAction, sendMagicLoginLinkAction } from './auth.actions';

const mockCookies = jest.fn();
const mockHeaders = jest.fn();
const mockSetCookie = jest.fn();
const mockCreateSessionCookie = jest.fn();
const mockSendMagicLoginLink = jest.fn();
const mockArchiveEmulatorMagicLoginEmail = jest.fn();
const mockValidateMagicLoginContinueUrl = jest.fn();

jest.mock('next/headers', () => ({
	cookies: (...args: unknown[]): unknown => mockCookies(...args),
	headers: (...args: unknown[]): unknown => mockHeaders(...args),
}));

jest.mock('@/modules/auth/session.service', () => ({
	getCurrentSessions: jest.fn(),
	getCurrentUser: jest.fn(),
	getSessionByType: jest.fn(),
}));

jest.mock('./auth.service', () => ({
	archiveEmulatorMagicLoginEmail: (...args: unknown[]): unknown => mockArchiveEmulatorMagicLoginEmail(...args),
	createSessionCookie: (...args: unknown[]): unknown => mockCreateSessionCookie(...args),
	sendMagicLoginLink: (...args: unknown[]): unknown => mockSendMagicLoginLink(...args),
	validateMagicLoginContinueUrl: (...args: unknown[]): unknown => mockValidateMagicLoginContinueUrl(...args),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockCookies.mockResolvedValue({ set: mockSetCookie });
	mockHeaders.mockResolvedValue(new Headers({ origin: 'https://socialincome.org', 'x-real-ip': '203.0.113.12' }));
	mockValidateMagicLoginContinueUrl.mockReturnValue(resultOk({ language: 'en', origin: 'https://socialincome.org' }));
	mockSendMagicLoginLink.mockResolvedValue(resultOk(undefined));
	mockArchiveEmulatorMagicLoginEmail.mockResolvedValue(resultOk(undefined));
});

test('validates a public magic-link request and passes the trusted request headers to the service', async () => {
	const input = {
		email: 'ada@example.com',
		continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
	};

	await expect(sendMagicLoginLinkAction(input)).resolves.toEqual(resultOk(undefined));
	expect(mockValidateMagicLoginContinueUrl).toHaveBeenCalledWith(input.email, input.continueUrl, 'https://socialincome.org');
	expect(mockSendMagicLoginLink).toHaveBeenCalledWith({
		...input,
		requestOrigin: 'https://socialincome.org',
		requesterIp: '203.0.113.12',
	});
});

test('keeps delivery failures indistinguishable from successful magic-link requests', async () => {
	mockSendMagicLoginLink.mockResolvedValue(resultFail('Could not send sign-in link'));

	await expect(
		sendMagicLoginLinkAction({
			email: 'ada@example.com',
			continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
		}),
	).resolves.toEqual(resultOk(undefined));
});

test('archives the safe login email after Firebase emulator delivery', async () => {
	const input = {
		email: 'ada@example.com',
		continueUrl: 'https://socialincome.org/en/usd/auth/confirm-login?email=ada%40example.com',
		emulator: true,
	};

	await expect(sendMagicLoginLinkAction(input)).resolves.toEqual(resultOk(undefined));
	expect(mockArchiveEmulatorMagicLoginEmail).toHaveBeenCalledWith({
		email: input.email,
		continueUrl: input.continueUrl,
		requestOrigin: 'https://socialincome.org',
	});
	expect(mockSendMagicLoginLink).not.toHaveBeenCalled();
});

test('rejects malformed requests before calling the magic-link service', async () => {
	await expect(sendMagicLoginLinkAction({ email: 'invalid', continueUrl: 'https://socialincome.org' })).resolves.toEqual(
		resultFail('Invalid sign-in request'),
	);
	expect(mockSendMagicLoginLink).not.toHaveBeenCalled();
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

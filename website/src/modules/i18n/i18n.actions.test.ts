import { ZodError } from 'zod';
import { switchToDefaultLanguageAction } from './i18n.actions';

const mockCookies = jest.fn();
const mockSetCookie = jest.fn();
const mockRedirect = jest.fn((path: string): never => {
	throw new Error(`NEXT_REDIRECT:${path}`);
});

jest.mock('next/headers', () => ({
	cookies: (...args: unknown[]): unknown => mockCookies(...args),
}));

jest.mock('next/navigation', () => ({
	redirect: (path: string): never => mockRedirect(path),
}));

beforeEach(() => {
	jest.clearAllMocks();
	mockCookies.mockResolvedValue({ set: mockSetCookie });
});

test('switches the pathname language, persists the default language, and redirects', async () => {
	await expect(switchToDefaultLanguageAction('/de/int/journal/article')).rejects.toThrow(
		'NEXT_REDIRECT:/en/int/journal/article',
	);

	expect(mockSetCookie).toHaveBeenCalledWith('si_lang', 'en', {
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
		sameSite: 'lax',
	});
});

test('redirects short paths to the default language and region without setting a cookie', async () => {
	await expect(switchToDefaultLanguageAction('/journal')).rejects.toThrow('NEXT_REDIRECT:/en/int');

	expect(mockCookies).not.toHaveBeenCalled();
	expect(mockSetCookie).not.toHaveBeenCalled();
});

test('rejects invalid input before cookie or redirect side effects', async () => {
	await expect(switchToDefaultLanguageAction(42)).rejects.toBeInstanceOf(ZodError);

	expect(mockCookies).not.toHaveBeenCalled();
	expect(mockRedirect).not.toHaveBeenCalled();
});

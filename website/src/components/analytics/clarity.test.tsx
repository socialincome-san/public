/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.socialincome.org/en/chf"}
 */
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let mockPathname = '/en/chf';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: () => mockPathname }));

process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'z2qs36fh1z';

// Required after setting the env variables, which the modules read on load.
const { Clarity } = jest.requireActual<typeof import('./clarity')>('./clarity');
const { setAnalyticsConsent } = jest.requireActual<typeof import('@/lib/analytics/analytics')>('@/lib/analytics/analytics');

const granted = ['consentv2', { ad_Storage: 'granted', analytics_Storage: 'granted' }];
const denied = ['consentv2', { ad_Storage: 'denied', analytics_Storage: 'denied' }];

const clarityScripts = () => document.querySelectorAll('script[src^="https://www.clarity.ms/"]');

const forgetClarity = () => {
	clarityScripts().forEach((script) => script.remove());
	Reflect.deleteProperty(window, 'clarity');
};

describe('Clarity', () => {
	let root: Root | undefined;

	const render = () => {
		root = createRoot(document.body.appendChild(document.createElement('div')));
		act(() => root?.render(<Clarity />));
	};

	beforeEach(() => {
		forgetClarity();
		localStorage.clear();
		// Forgets the choice earlier tests kept in memory, as a storage change in another tab does.
		window.dispatchEvent(new StorageEvent('storage', { key: null }));
		mockPathname = '/en/chf';
	});

	afterEach(() => {
		act(() => root?.unmount());
		root = undefined;
	});

	it('is not loaded while the visitor has not decided', () => {
		render();

		expect(clarityScripts()).toHaveLength(0);
		expect(window.clarity).toBeUndefined();
	});

	it('is not loaded after a decline', () => {
		localStorage.setItem('analytics-consent', 'denied');
		render();

		expect(clarityScripts()).toHaveLength(0);
		expect(window.clarity).toBeUndefined();
	});

	it('loads once the visitor accepts, and grants Clarity consent', () => {
		render();
		act(() => setAnalyticsConsent('granted'));

		expect(clarityScripts()).toHaveLength(1);
		expect(clarityScripts()[0]?.getAttribute('src')).toBe('https://www.clarity.ms/tag/z2qs36fh1z');
		expect(window.clarity?.q).toEqual([granted]);
	});

	it.each(['/portal', '/partner-space', '/en/chf/dashboard/contributions', '/en/chf/login', '/en/chf/auth/finish-login'])(
		'is never loaded on %s',
		(pathname) => {
			mockPathname = pathname;
			localStorage.setItem('analytics-consent', 'granted');
			render();

			expect(clarityScripts()).toHaveLength(0);
			expect(window.clarity).toBeUndefined();
		},
	);

	it('reloads the page when a client-side navigation enters an excluded route after Clarity has loaded', () => {
		// jsdom cannot navigate, so it reports the reload as an error instead of performing it.
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
		localStorage.setItem('analytics-consent', 'granted');
		render();
		mockPathname = '/en/chf/campaigns';
		act(() => root?.render(<Clarity />));

		expect(consoleError).not.toHaveBeenCalled();

		mockPathname = '/en/chf/login';
		act(() => root?.render(<Clarity />));

		const reloaded = consoleError.mock.calls.some(
			// jsdom's error comes from another realm, so `instanceof Error` is false.
			([error]: unknown[]) =>
				typeof error === 'object' &&
				error !== null &&
				'message' in error &&
				typeof error.message === 'string' &&
				error.message.includes('Not implemented: navigation'),
		);
		expect(reloaded).toBe(true);
		consoleError.mockRestore();
	});

	it('revokes consent and erases its cookies after a later decline, and stays off on the next page', () => {
		localStorage.setItem('analytics-consent', 'granted');
		render();
		act(() => setAnalyticsConsent('denied'));

		expect(window.clarity?.q).toEqual([granted, denied, ['consent', false]]);

		act(() => root?.unmount());
		forgetClarity();
		render();

		expect(clarityScripts()).toHaveLength(0);
		expect(window.clarity).toBeUndefined();
	});

	it('revokes consent when another tab clears the choice', () => {
		localStorage.setItem('analytics-consent', 'granted');
		render();
		localStorage.clear();
		act(() => {
			window.dispatchEvent(new StorageEvent('storage', { key: null }));
		});

		expect(window.clarity?.q).toEqual([granted, denied, ['consent', false]]);
	});
});

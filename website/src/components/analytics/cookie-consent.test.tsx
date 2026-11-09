/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.socialincome.org/en/chf"}
 */
import { act, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('next-intl', () => ({ useTranslations: () => Object.assign(() => '', { rich: () => '' }) }));
jest.mock('next/link', () => ({ __esModule: true, default: () => null }));
jest.mock('@socialincome/design-system/feedback/cookie-banner/cookie-banner', () => ({ CookieBanner: () => null }));
// Pushes `gtm.js` from an effect, as the real component's next/script does before requesting Tag Manager.
jest.mock('@next/third-parties/google', () => ({
	sendGTMEvent: jest.fn(),
	GoogleTagManager: () => {
		useEffect(() => {
			(window.dataLayer ??= []).push({ 'gtm.start': Date.now(), event: 'gtm.js' });
		}, []);

		return null;
	},
}));

process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';
process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

// Required after setting the env variables, which the modules read on load.
const { CookieConsent } = jest.requireActual<typeof import('./cookie-consent')>('./cookie-consent');

const commandIndex = (command: string, type: string) =>
	(window.dataLayer ?? []).findIndex(
		(entry) =>
			Object.prototype.toString.call(entry) === '[object Arguments]' &&
			Array.from(entry as IArguments)
				.slice(0, 2)
				.join() === `${command},${type}`,
	);
const gtmIndex = () =>
	(window.dataLayer ?? []).findIndex((entry) => typeof entry === 'object' && Reflect.get(entry, 'event') === 'gtm.js');

describe('CookieConsent', () => {
	it('applies a stored choice after the default and before Tag Manager loads', () => {
		localStorage.setItem('analytics-consent', 'granted');
		const root = createRoot(document.body.appendChild(document.createElement('div')));
		act(() => {
			root.render(<CookieConsent privacyPolicyHref="/legal" />);
		});

		expect(commandIndex('consent', 'default')).toBe(0);
		expect(commandIndex('consent', 'update')).toBe(1);
		expect(gtmIndex()).toBeGreaterThan(1);
		act(() => root.unmount());
	});
});

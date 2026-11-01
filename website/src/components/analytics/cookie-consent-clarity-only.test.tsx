/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://www.socialincome.org/en/chf"}
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockGoogleTagManager = jest.fn(() => null);

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('next-intl', () => ({ useTranslations: () => Object.assign(() => '', { rich: () => '' }) }));
jest.mock('next/link', () => ({ __esModule: true, default: () => null }));
jest.mock('@socialincome/design-system/feedback/cookie-banner/cookie-banner', () => ({
	CookieBanner: () => <div data-testid="cookie-banner" />,
}));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn(), GoogleTagManager: mockGoogleTagManager }));

// Clarity alone still needs consent, so the banner must appear without Tag Manager.
delete process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;
process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'z2qs36fh1z';
process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';

// Required after setting the env variables, which the modules read on load.
const { CookieConsent } = jest.requireActual<typeof import('./cookie-consent')>('./cookie-consent');

describe('CookieConsent with only Clarity configured', () => {
	it('asks for consent and does not load Tag Manager', () => {
		const root = createRoot(document.body.appendChild(document.createElement('div')));
		act(() => root.render(<CookieConsent privacyPolicyHref="/legal" />));

		expect(document.querySelector('[data-testid="cookie-banner"]')).not.toBeNull();
		expect(mockGoogleTagManager).not.toHaveBeenCalled();
		act(() => root.unmount());
	});
});

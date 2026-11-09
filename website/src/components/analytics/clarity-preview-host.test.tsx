/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://socialincome-git-feature.vercel.app/en/chf"}
 */
import { act } from 'react';
import { createRoot } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn() }));
jest.mock('next/navigation', () => ({ usePathname: () => '/en/chf' }));

// Production builds are also served on Vercel URLs, which must not load Clarity.
process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = 'z2qs36fh1z';

// Required after setting the env variables, which the modules read on load.
const { Clarity } = jest.requireActual<typeof import('./clarity')>('./clarity');

describe('Clarity on a Vercel URL', () => {
	it('is not loaded even with consent', () => {
		localStorage.setItem('analytics-consent', 'granted');
		const root = createRoot(document.body.appendChild(document.createElement('div')));
		act(() => root.render(<Clarity />));

		expect(document.querySelector('script[src^="https://www.clarity.ms/"]')).toBeNull();
		expect(window.clarity).toBeUndefined();
		act(() => root.unmount());
	});
});

/** @jest-environment jsdom */
import { sendGAEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGAEvent: jest.fn() }));

process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID = 'G-TEST';

// Required after setting the env variable, which the module reads on load.
const { setAnalyticsConsent, trackEvent } = jest.requireActual<typeof import('./analytics')>('./analytics');

describe('trackEvent', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	it('sends only to Vercel while consent is undecided', () => {
		trackEvent('donate', { amount: 50 });

		expect(track).toHaveBeenCalledWith('donate', { amount: 50 });
		expect(sendGAEvent).not.toHaveBeenCalled();
	});

	it('also sends to Google Analytics after consent', () => {
		setAnalyticsConsent('granted');
		trackEvent('donate', { amount: 50 });

		expect(track).toHaveBeenCalledWith('donate', { amount: 50 });
		expect(sendGAEvent).toHaveBeenCalledWith('event', 'donate', { amount: 50 });
	});

	it('stops sending to Google Analytics and disables it when consent is revoked', () => {
		setAnalyticsConsent('granted');
		setAnalyticsConsent('denied');
		trackEvent('donate');

		expect(track).toHaveBeenCalledWith('donate', undefined);
		expect(sendGAEvent).not.toHaveBeenCalled();
		expect(Reflect.get(window, 'ga-disable-G-TEST')).toBe(true);
	});
});

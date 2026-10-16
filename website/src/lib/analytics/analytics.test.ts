/** @jest-environment jsdom */
import { sendGTMEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn() }));

process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';

// Required after setting the env variable, which the module reads on load.
const { setAnalyticsConsent, trackEvent } = jest.requireActual<typeof import('./analytics')>('./analytics');

describe('trackEvent', () => {
	beforeEach(() => {
		localStorage.clear();
		jest.clearAllMocks();
	});

	it('pushes to Vercel and the Tag Manager data layer before consent, for consent mode to handle', () => {
		trackEvent('donation_amount_confirmed', { value: 50, currency: 'CHF' });

		expect(track).toHaveBeenCalledWith('donation_amount_confirmed', { value: 50, currency: 'CHF' });
		expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'donation_amount_confirmed', value: 50, currency: 'CHF' });
	});

	it('sends lists such as GA4 items to Tag Manager only', () => {
		setAnalyticsConsent('granted');
		const items = [{ item_id: 'donation', price: 50 }];
		trackEvent('donation_completed', { value: 50, items });

		expect(track).toHaveBeenCalledWith('donation_completed', { value: 50 });
		expect(sendGTMEvent).toHaveBeenCalledWith({ event: 'donation_completed', value: 50, items });
	});

	it('updates Google consent mode when consent is revoked', () => {
		const gtag = jest.fn();
		Reflect.set(window, 'gtag', gtag);
		setAnalyticsConsent('granted');
		setAnalyticsConsent('denied');

		expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
		});
	});
});

describe('registerFirstPartyGoogleTag', () => {
	const load = (vercelEnv: string) => {
		process.env.NEXT_PUBLIC_VERCEL_ENV = vercelEnv;
		jest.resetModules();

		return jest.requireActual<typeof import('./analytics')>('./analytics');
	};
	const firstPartyTags = (): unknown => Reflect.get(window, 'google_tags_first_party');

	afterEach(() => {
		Reflect.deleteProperty(window, 'google_tags_first_party');
		delete process.env.NEXT_PUBLIC_VERCEL_ENV;
	});

	it('does nothing outside production, where there is no gateway', () => {
		load('preview').registerFirstPartyGoogleTag();

		expect(firstPartyTags()).toBeUndefined();
	});

	it('registers the container once', () => {
		const { registerFirstPartyGoogleTag } = load('production');
		registerFirstPartyGoogleTag();
		registerFirstPartyGoogleTag();

		expect(firstPartyTags()).toEqual(['GTM-TEST']);
	});
});

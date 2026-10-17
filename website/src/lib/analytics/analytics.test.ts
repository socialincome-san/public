/** @jest-environment jsdom */
import { sendGTMEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';

jest.mock('@vercel/analytics', () => ({ track: jest.fn() }));
jest.mock('@next/third-parties/google', () => ({ sendGTMEvent: jest.fn() }));

process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID = 'GTM-TEST';

// Required after setting the env variable, which the module reads on load.
const { ensureConsentDefault, setAnalyticsConsent, trackEvent } =
	jest.requireActual<typeof import('./analytics')>('./analytics');

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

describe('ensureConsentDefault', () => {
	const denied = {
		ad_storage: 'denied',
		ad_user_data: 'denied',
		ad_personalization: 'denied',
		analytics_storage: 'denied',
	};
	const queued = () => (window.dataLayer ?? []).map((entry): unknown[] => Array.from(entry as IArguments));

	beforeEach(() => {
		localStorage.clear();
		Reflect.deleteProperty(window, 'consentDefaultQueued');
		Reflect.deleteProperty(window, 'dataLayer');
		Reflect.deleteProperty(window, 'gtag');
	});

	it('queues the denied default once, as gtag.js arguments, when an event comes first', () => {
		trackEvent('donate_nav_click');
		trackEvent('donate_nav_click');
		ensureConsentDefault();

		expect(Object.prototype.toString.call(window.dataLayer?.[0])).toBe('[object Arguments]');
		expect(queued()).toEqual([['consent', 'default', { ...denied, wait_for_update: 500 }]]);
	});

	it('applies a choice stored on an earlier visit right after the default', () => {
		localStorage.setItem('analytics-consent', 'granted');
		ensureConsentDefault();

		expect(queued()).toEqual([
			['consent', 'default', { ...denied, wait_for_update: 500 }],
			[
				'consent',
				'update',
				{ ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'granted' },
			],
		]);
	});
});

describe('consent changes in another tab', () => {
	it('updates Google consent mode in this tab', () => {
		const gtag = jest.fn();
		Reflect.set(window, 'gtag', gtag);
		localStorage.setItem('analytics-consent', 'denied');
		window.dispatchEvent(new StorageEvent('storage', { key: 'analytics-consent' }));

		expect(gtag).toHaveBeenLastCalledWith('consent', 'update', {
			ad_storage: 'denied',
			ad_user_data: 'denied',
			ad_personalization: 'denied',
			analytics_storage: 'denied',
		});
	});

	it('falls back to denied when another tab clears storage', () => {
		const gtag = jest.fn();
		Reflect.set(window, 'gtag', gtag);
		localStorage.clear();
		window.dispatchEvent(new StorageEvent('storage', { key: null }));

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

describe('isGoogleTagGatewayHost', () => {
	afterEach(() => {
		delete process.env.NEXT_PUBLIC_VERCEL_ENV;
	});

	it('is false on other hosts, such as Vercel URLs of the production deployment', () => {
		process.env.NEXT_PUBLIC_VERCEL_ENV = 'production';
		jest.resetModules();
		const { isGoogleTagGatewayHost } = jest.requireActual<typeof import('./analytics')>('./analytics');

		expect(window.location.hostname).toBe('localhost');
		expect(isGoogleTagGatewayHost()).toBe(false);
	});
});

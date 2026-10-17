import { sendGTMEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';
import { useSyncExternalStore } from 'react';

export type AnalyticsConsent = 'granted' | 'denied' | 'undecided';

type EventValue = string | number | boolean | null | undefined;

type EventProperties = Record<string, EventValue | Record<string, EventValue>[]>;

export const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;

// Google tag gateway (Cloudflare) serves GTM from our own domain. Only exists in production.
export const googleTagGatewayUrl =
	process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 'https://www.socialincome.org/metrics/' : undefined;

// Production is also reachable on Vercel URLs, which must not load Tag Manager. Client only.
export const isGoogleTagGatewayHost = () =>
	googleTagGatewayUrl !== undefined && window.location.hostname === new URL(googleTagGatewayUrl).hostname;

declare global {
	interface Window {
		google_tags_first_party?: string[];
	}
}

// Google tag gateway: makes the Google tag send hits through /metrics/. Replaces Cloudflare's injected snippet.
export const registerFirstPartyGoogleTag = () => {
	if (!googleTagGatewayUrl || !googleTagManagerId || typeof window === 'undefined') {
		return;
	}
	const w = window;
	w.google_tags_first_party ??= [];
	if (!w.google_tags_first_party.includes(googleTagManagerId)) {
		w.google_tags_first_party.push(googleTagManagerId);
	}
};

/** Google Consent Mode v2 signals. One choice covers both statistics (Analytics) and marketing (Ads). */
export const getConsentModeSignals = (state: 'granted' | 'denied') => ({
	ad_storage: state,
	ad_user_data: state,
	ad_personalization: state,
	analytics_storage: state,
});

const isGtag = (value: unknown): value is (...args: unknown[]) => void => typeof value === 'function';

const CONSENT_STORAGE_KEY = 'analytics-consent';

const listeners = new Set<() => void>();
let consentSettingsOpen = false;

const notify = () => listeners.forEach((listener) => listener());

const subscribe = (listener: () => void) => {
	listeners.add(listener);
	// Keeps tabs in sync when the choice changes in another one.
	window.addEventListener('storage', listener);

	return () => {
		listeners.delete(listener);
		window.removeEventListener('storage', listener);
	};
};

const readConsent = (): AnalyticsConsent => {
	try {
		const stored = localStorage.getItem(CONSENT_STORAGE_KEY);

		return stored === 'granted' || stored === 'denied' ? stored : 'undecided';
	} catch {
		// Storage is blocked, e.g. in some private modes: ask again on every page load.
		return 'undecided';
	}
};

// Tag Manager loads before the choice, so its Google tags must be told about it. `gtag` is defined by the consent
// mode script that runs before Tag Manager loads.
const updateGoogleConsent = (consent: 'granted' | 'denied') => {
	const gtag: unknown = Reflect.get(window, 'gtag');
	if (isGtag(gtag)) {
		gtag('consent', 'update', getConsentModeSignals(consent));
	}
};

// A choice made in another tab must also reach the Google tags already running in this one.
if (typeof window !== 'undefined') {
	window.addEventListener('storage', (event) => {
		const consent = readConsent();
		if (event.key === CONSENT_STORAGE_KEY && consent !== 'undecided') {
			updateGoogleConsent(consent);
		}
	});
}

export const setAnalyticsConsent = (consent: 'granted' | 'denied') => {
	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, consent);
	} catch {
		// The choice still applies until the page is reloaded.
	}
	updateGoogleConsent(consent);
	consentSettingsOpen = false;
	notify();
};

export const openConsentSettings = () => {
	consentSettingsOpen = true;
	notify();
};

/** `null` while rendering on the server, where the stored choice is unknown. */
export const useAnalyticsConsent = () => useSyncExternalStore<AnalyticsConsent | null>(subscribe, readConsent, () => null);

export const useConsentSettingsOpen = () =>
	useSyncExternalStore(
		subscribe,
		() => consentSettingsOpen,
		() => false,
	);

/**
 * Sends a custom event to Vercel Analytics and the Google Tag Manager data layer, where its triggers forward it to
 * Google Analytics and Google Ads. Without consent, Google's consent mode sends them as cookieless pings. Client only.
 * Vercel Analytics is cookieless and needs no consent.
 */
export const trackEvent = (name: string, properties?: EventProperties) => {
	// Vercel Analytics only accepts flat values, so lists such as GA4 `items` go to Tag Manager only.
	track(
		name,
		properties &&
			Object.fromEntries(
				Object.entries(properties).filter((entry): entry is [string, EventValue] => !Array.isArray(entry[1])),
			),
	);
	if (googleTagManagerId) {
		sendGTMEvent({ event: name, ...properties });
	}
};

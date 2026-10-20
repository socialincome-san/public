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
		consentDefaultQueued?: boolean;
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
const getConsentModeSignals = (state: 'granted' | 'denied') => ({
	ad_storage: state,
	ad_user_data: state,
	ad_personalization: state,
	analytics_storage: state,
});

const isGtag = (value: unknown): value is (...args: unknown[]) => void => typeof value === 'function';

const CONSENT_STORAGE_KEY = 'analytics-consent';

const listeners = new Set<() => void>();
let consentSettingsOpen = false;
// The choice for this page load, for when storage is blocked or does not keep it.
let sessionConsent: 'granted' | 'denied' | undefined;

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
		if (stored === 'granted' || stored === 'denied') {
			return stored;
		}
	} catch {
		// Storage is blocked, e.g. in some private modes: ask again on every page load.
	}

	return sessionConsent ?? 'undecided';
};

// Tag Manager loads before the choice, so its Google tags must be told about it. `gtag` is defined by
// `ensureConsentDefault`, which runs before Tag Manager loads.
const updateGoogleConsent = (consent: 'granted' | 'denied') => {
	const gtag: unknown = Reflect.get(window, 'gtag');
	if (isGtag(gtag)) {
		gtag('consent', 'update', getConsentModeSignals(consent));
	}
};

const gtag: (...args: unknown[]) => void = function () {
	// eslint-disable-next-line prefer-rest-params -- gtag.js requires the arguments object
	(window.dataLayer ??= []).push(arguments);
};

/**
 * Queues the denied Consent Mode default, plus the choice stored on an earlier visit, ahead of any other data layer
 * entry. Runs once per page load, from whichever comes first: an event or the Tag Manager setup. Client only.
 */
export const ensureConsentDefault = () => {
	if (window.consentDefaultQueued) {
		return;
	}
	window.consentDefaultQueued = true;
	window.gtag ??= gtag;
	gtag('consent', 'default', { ...getConsentModeSignals('denied'), wait_for_update: 500 });
	if (readConsent() === 'granted') {
		updateGoogleConsent('granted');
	}
};

// A choice made in another tab must also reach the Google tags already running in this one.
if (typeof window !== 'undefined') {
	window.addEventListener('storage', (event) => {
		// `key` is null when another tab clears all storage. A removed choice must not leave consent granted here.
		if (event.key === CONSENT_STORAGE_KEY || event.key === null) {
			// Registered before the React listeners, so they read the choice from the other tab, not this one.
			sessionConsent = undefined;
			const consent = readConsent();
			updateGoogleConsent(consent === 'undecided' ? 'denied' : consent);
		}
	});
}

export const setAnalyticsConsent = (consent: 'granted' | 'denied') => {
	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, consent);
	} catch {
		// Kept in `sessionConsent` until the page is reloaded.
	}
	sessionConsent = consent;
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
		ensureConsentDefault();
		sendGTMEvent({ event: name, ...properties });
	}
};

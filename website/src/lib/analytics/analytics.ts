import { sendGTMEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';
import { useSyncExternalStore } from 'react';

export type AnalyticsConsent = 'granted' | 'denied' | 'undecided';

type EventProperties = Record<string, string | number | boolean | null>;

export const googleTagManagerId = process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID;

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

export const setAnalyticsConsent = (consent: 'granted' | 'denied') => {
	try {
		localStorage.setItem(CONSENT_STORAGE_KEY, consent);
	} catch {
		// The choice still applies until the page is reloaded.
	}
	// Once loaded, Tag Manager can't be unloaded, so its Google tags must be told about the new choice. `gtag` is
	// defined by the consent mode script that runs before Tag Manager loads.
	const gtag: unknown = Reflect.get(window, 'gtag');
	if (isGtag(gtag)) {
		gtag('consent', 'update', getConsentModeSignals(consent));
	}
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
 * Sends a custom event to Vercel Analytics and, if the visitor consented, to the Google Tag Manager data layer,
 * where its triggers forward it to Google Analytics and Google Ads. Client only.
 * Vercel Analytics is cookieless and needs no consent.
 * @public Not called yet; the entry point for custom events.
 */
export const trackEvent = (name: string, properties?: EventProperties) => {
	track(name, properties);
	if (googleTagManagerId && readConsent() === 'granted') {
		sendGTMEvent({ event: name, ...properties });
	}
};

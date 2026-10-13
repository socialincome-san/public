import { sendGAEvent } from '@next/third-parties/google';
import { track } from '@vercel/analytics';
import { useSyncExternalStore } from 'react';

export type AnalyticsConsent = 'granted' | 'denied' | 'undecided';

type EventProperties = Record<string, string | number | boolean | null>;

export const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;

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
	if (googleAnalyticsId) {
		// Google's opt-out flag: once gtag.js is loaded it can't be unloaded, so revoking consent must disable it.
		Reflect.set(window, `ga-disable-${googleAnalyticsId}`, consent !== 'granted');
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
 * Sends a custom event to Vercel Analytics and, if the visitor consented, Google Analytics. Client only.
 * Vercel Analytics is cookieless and needs no consent.
 * @public Not called yet; the entry point for custom events.
 */
export const trackEvent = (name: string, properties?: EventProperties) => {
	track(name, properties);
	if (googleAnalyticsId && readConsent() === 'granted') {
		sendGAEvent('event', name, properties ?? {});
	}
};

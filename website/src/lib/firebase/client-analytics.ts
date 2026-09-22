'use client';

import {
	initializeFirebaseAnalytics,
	setFirebaseConsent,
	type FirebaseClientApp,
	type FirebaseConsentStatus,
} from '@/integrations/firebase/firebase-client.integration';

export type ConsentStatus = FirebaseConsentStatus;

export const initializeAnalytics = (app: FirebaseClientApp): void => {
	initializeFirebaseAnalytics(app);
};

export const setAnalyticsConsent = (mode: ConsentStatus): void => {
	setFirebaseConsent(mode);
};

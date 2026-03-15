'use client';

import { FacebookTracking } from '@/components/legacy/analytics/facebook-tracking';
import { GoogleTagManager } from '@/components/legacy/analytics/google-tag-manager';
import { LinkedInTracking } from '@/components/legacy/analytics/linkedin-tracking';
import { useFirebaseApp } from '@/lib/firebase/hooks/useFirebaseApp';
import { initializeAnalytics } from '@firebase/analytics';
import { ConsentSettings, ConsentStatusString, setConsent } from 'firebase/analytics';
import { useEffect, useState } from 'react';

const getAnalyticsCookieConsent = (mode: ConsentStatusString) =>
	({
		analytics_storage: mode,
		ad_storage: mode,
		ad_user_data: mode,
		ad_personalization: mode,
		functionality_storage: mode,
		security_storage: mode,
		personalization_storage: mode,
	}) as ConsentSettings;

if (typeof window !== 'undefined') {
	const cookieConsent = localStorage.getItem('cookie_consent');
	if (cookieConsent === 'granted') {
		setConsent(getAnalyticsCookieConsent('granted'));
		console.debug('Set default consent mode to granted');
	} else {
		setConsent(getAnalyticsCookieConsent('denied'));
		console.debug('Set default consent mode to denied');
	}
}

export const AnalyticsInitializer = () => {
	const app = useFirebaseApp();
	const [allowTracking, setAllowTracking] = useState(false);

	useEffect(() => {
		if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
			initializeAnalytics(app);
			const cookieConsent = localStorage.getItem('cookie_consent');
			if (cookieConsent === 'granted') {
				setConsent(getAnalyticsCookieConsent('granted'));
				setAllowTracking(true);
			} else {
				setConsent(getAnalyticsCookieConsent('denied'));
			}
		}
	}, [app]);

	if (allowTracking) {
		return (
			<>
				<GoogleTagManager />
				<FacebookTracking />
				<LinkedInTracking />
			</>
		);
	}
	return null;
};

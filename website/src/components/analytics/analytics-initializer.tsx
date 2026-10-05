'use client';

import { FacebookTracking } from '@/components/analytics/facebook-tracking';
import { GoogleTagManager } from '@/components/analytics/google-tag-manager';
import { LinkedInTracking } from '@/components/analytics/linkedin-tracking';
import { initializeAnalytics, setAnalyticsConsent } from '@/lib/firebase/client-analytics';
import { useFirebaseApp } from '@/lib/firebase/hooks/useFirebaseApp';
import { useEffect, useState } from 'react';

if (typeof window !== 'undefined') {
	const cookieConsent = localStorage.getItem('cookie_consent');
	if (cookieConsent === 'granted') {
		setAnalyticsConsent('granted');
		console.debug('Set default consent mode to granted');
	} else {
		setAnalyticsConsent('denied');
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
				setAnalyticsConsent('granted');
				// eslint-disable-next-line react-hooks/set-state-in-effect
				setAllowTracking(true);
			} else {
				setAnalyticsConsent('denied');
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

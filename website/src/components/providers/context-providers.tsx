'use client';

import { COUNTRY_COOKIE, CURRENCY_COOKIE, LANGUAGE_COOKIE, REGION_COOKIE } from '@/app/[lang]/[region]';
import { ApiProvider } from '@/components/providers/api-provider';
import { GlobalStateProviderProvider } from '@/components/providers/global-state-provider';
import { FacebookTracking } from '@/components/tracking/facebook-tracking';
import { GoogleTagManager } from '@/components/tracking/google-tag-manager';
import { LinkedInTracking } from '@/components/tracking/linkedin-tracking';
import { useCookieState } from '@/hooks/useCookieState';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { initializeAnalytics } from '@firebase/analytics';
import { DEFAULT_REGION } from '@socialincome/shared/src/firebase';
import { CountryCode } from '@socialincome/shared/src/types/country';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { ConsentSettings, ConsentStatusString, setConsent } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import _ from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { PropsWithChildren, Suspense, createContext, useContext, useEffect, useState } from 'react';
import {
	AnalyticsProvider,
	AuthProvider,
	FirebaseAppProvider,
	FirestoreProvider,
	StorageProvider,
	useFirebaseApp,
} from 'reactfire';

// These variables are needed so that the emulators are only initialized once. Probably due to the React Strict mode, it
// happens that the emulators get initialized multiple times in the development environment.
let connectAuthEmulatorCalled = false;
let connectFirestoreEmulatorCalled = false;
let connectStorageEmulatorCalled = false;
let connectFunctionsEmulatorCalled = false;

export const getAnalyticsCookieConsent = (mode: ConsentStatusString) =>
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

function AnalyticsProviderWrapper({ children }: PropsWithChildren) {
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
	}, [app, allowTracking]);

	return (
		<>
			<Analytics />
			{allowTracking ? (
				<>
					<GoogleTagManager />
					<FacebookTracking />
					<LinkedInTracking />
					<AnalyticsProvider sdk={initializeAnalytics(app)}>{children}</AnalyticsProvider>
				</>
			) : (
				children
			)}
		</>
	);
}

function FirebaseSDKProviders({ children }: PropsWithChildren) {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const functions = getFunctions(app, DEFAULT_REGION);
	const storage = getStorage(app);

	const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
	const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
	const firestoreEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT);
	const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
	const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);
	const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
	const functionsEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);

	if (authEmulatorUrl && !connectAuthEmulatorCalled) {
		console.debug('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled = true;
	}
	if (firestoreEmulatorHost && firestoreEmulatorPort && !connectFirestoreEmulatorCalled) {
		console.debug('Using firestore emulator');
		connectFirestoreEmulator(firestore, firestoreEmulatorHost, firestoreEmulatorPort);
		connectFirestoreEmulatorCalled = true;
	}
	if (storageEmulatorHost && storageEmulatorPort && !connectStorageEmulatorCalled) {
		console.debug('Using storage emulator');
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		connectStorageEmulatorCalled = true;
	}
	if (functionsEmulatorHost && functionsEmulatorPort && connectFunctionsEmulatorCalled) {
		console.debug('Using functions emulator');
		connectFunctionsEmulator(functions, functionsEmulatorHost, functionsEmulatorPort);
		connectFunctionsEmulatorCalled = true;
	}

	return (
		<AuthProvider sdk={auth}>
			<FirestoreProvider sdk={firestore}>
				<StorageProvider sdk={storage}>
					<AnalyticsProviderWrapper>{children}</AnalyticsProviderWrapper>
				</StorageProvider>
			</FirestoreProvider>
		</AuthProvider>
	);
}

type I18nContextType = {
	country: CountryCode | undefined;
	setCountry: (country: CountryCode) => void;
	language: WebsiteLanguage | undefined;
	setLanguage: (language: WebsiteLanguage) => void;
	region: WebsiteRegion | undefined;
	setRegion: (country: WebsiteRegion) => void;
	currency: WebsiteCurrency | undefined;
	setCurrency: (currency: WebsiteCurrency) => void;
};

const I18nContext = createContext<I18nContextType>(undefined!);
export const useI18n = () => useContext(I18nContext);

function I18nUrlUpdater() {
	// This component is used to watch the URL and update the language and region in the context if the URL changes.
	// It's a separate component because it uses the useSearchParams hook, and needs to be wrapped in a Suspense
	// boundary (https://nextjs.org/docs/messages/deopted-into-client-rendering).
	const router = useRouter();
	const searchParams = useSearchParams();
	const searchParamsString = searchParams.toString();
	const { language, setLanguage, region, setRegion } = useI18n();

	useEffect(() => {
		const urlSegments = window.location.pathname.split('/');
		const languageInUrl = urlSegments[1] as WebsiteLanguage;
		if (_.isUndefined(language)) {
			setLanguage(languageInUrl);
		} else if (languageInUrl !== language) {
			urlSegments[1] = language;
			router.push(urlSegments.join('/') + (searchParamsString ? `?${searchParamsString}` : ''));
		}
	}, [language, router, searchParamsString, setLanguage]);

	useEffect(() => {
		const urlSegments = window.location.pathname.split('/');
		const regionInUrl = urlSegments[2] as WebsiteRegion;
		if (_.isUndefined(region)) {
			setRegion(regionInUrl);
		} else if (regionInUrl !== region) {
			urlSegments[2] = region;
			router.push(urlSegments.join('/') + (searchParamsString ? `?${searchParamsString}` : ''));
		}
	}, [region, router, searchParamsString, setRegion]);

	return null;
}

function I18nProvider({ children }: PropsWithChildren) {
	const { value: language, setCookie: setLanguage } = useCookieState<WebsiteLanguage>(LANGUAGE_COOKIE);
	const { value: region, setCookie: setRegion } = useCookieState<WebsiteRegion>(REGION_COOKIE);
	const { value: currency, setCookie: setCurrency } = useCookieState<WebsiteCurrency>(CURRENCY_COOKIE);
	const { value: country, setCookie: setCountry } = useCookieState<CountryCode>(COUNTRY_COOKIE);

	return (
		<I18nContext.Provider
			value={{
				country: country,
				setCountry: (country) => setCountry(country, { expires: 7 }),
				language: language,
				setLanguage: (language) => setLanguage(language, { expires: 7 }),
				region: region,
				setRegion: (country) => setRegion(country, { expires: 7 }),
				currency: currency,
				setCurrency: (currency) => setCurrency(currency, { expires: 7 }),
			}}
		>
			<Suspense fallback={null}>
				<I18nUrlUpdater />
			</Suspense>
			{children}
		</I18nContext.Provider>
	);
}

export function ContextProviders({ children }: PropsWithChildren) {
	const firebaseConfig = {
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	};
	const queryClient = new QueryClient();

	return (
		<FirebaseAppProvider firebaseConfig={firebaseConfig}>
			<FirebaseSDKProviders>
				<ApiProvider>
					<QueryClientProvider client={queryClient}>
						<GlobalStateProviderProvider>
							<I18nProvider>{children}</I18nProvider>
						</GlobalStateProviderProvider>
					</QueryClientProvider>
				</ApiProvider>
			</FirebaseSDKProviders>
		</FirebaseAppProvider>
	);
}

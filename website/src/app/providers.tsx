'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics, getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import { connectAuthEmulator, getAuth } from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, getStorage } from 'firebase/storage';
import { usePathname } from 'next/navigation';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
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

function AnalyticsProviderWrapper({ children }: PropsWithChildren) {
	const app = useFirebaseApp();
	const [analytics, setAnalytics] = useState<Analytics | null>(null);

	useEffect(() => {
		if (process.env.NEXT_PUBLIC_FIREBASE_APP_ID) {
			isAnalyticsSupported().then((isSupported) => {
				if (isSupported) {
					console.log('Using analytics');
					setAnalytics(getAnalytics(app));
				}
			});
		}
	}, [app]);

	if (analytics) {
		return <AnalyticsProvider sdk={analytics}>{children}</AnalyticsProvider>;
	} else {
		return children;
	}
}

function FirebaseSDKProviders({ children }: PropsWithChildren) {
	const app = useFirebaseApp();
	const auth = getAuth(app);
	const firestore = getFirestore(app);
	const functions = getFunctions(app);
	const storage = getStorage(app);

	const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
	const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
	const firestoreEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT);
	const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
	const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);
	const functionsEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_HOST;
	const functionsEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FUNCTIONS_EMULATOR_PORT);

	if (authEmulatorUrl && !connectAuthEmulatorCalled) {
		console.log('Using auth emulator');
		connectAuthEmulator(auth, authEmulatorUrl, { disableWarnings: true });
		connectAuthEmulatorCalled = true;
	}
	if (firestoreEmulatorHost && firestoreEmulatorPort && !connectFirestoreEmulatorCalled) {
		console.log('Using firestore emulator');
		connectFirestoreEmulator(firestore, firestoreEmulatorHost, firestoreEmulatorPort);
		connectFirestoreEmulatorCalled = true;
	}
	if (storageEmulatorHost && storageEmulatorPort && !connectStorageEmulatorCalled) {
		console.log('Using storage emulator');
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		connectStorageEmulatorCalled = true;
	}
	if (functionsEmulatorHost && functionsEmulatorPort && connectFunctionsEmulatorCalled) {
		console.log('Using functions emulator');
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

export function ThemeProvider({ children }: PropsWithChildren) {
	const pathname = usePathname();
	const baseSegment = pathname?.split('/')[3];

	let theme;
	switch (baseSegment) {
		case 'donate':
			theme = 'theme-blue';
			break;
		default:
			theme = 'theme-default';
	}

	return <body className={theme}>{children}</body>;
}

export function Providers({ children }: PropsWithChildren) {
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
				<QueryClientProvider client={queryClient}>
					<ThemeProvider>
						<Toaster />
						{children}
					</ThemeProvider>
				</QueryClientProvider>
			</FirebaseSDKProviders>
		</FirebaseAppProvider>
	);
}

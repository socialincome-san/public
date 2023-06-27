'use client';

import { FirebaseApp } from '@firebase/app';
import { initializeApp } from 'firebase/app';
import { useEffect, useState } from 'react';

interface InitializeFirebaseClientProps {
	firebaseConfig: any;
	appName?: string;
}

export function useInitializeFirebaseClient({ firebaseConfig, appName = '[DEFAULT]' }: InitializeFirebaseClientProps) {
	const [firebaseApp, setFirebaseApp] = useState<FirebaseApp>();

	useEffect(() => {
		if (!firebaseApp) {
			setFirebaseApp(initializeApp(firebaseConfig, appName));
		}
	}, [firebaseApp]);

	return firebaseApp;
}

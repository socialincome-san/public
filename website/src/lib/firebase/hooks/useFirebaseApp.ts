'use client';

import { FirebaseAppContext } from '@/lib/firebase/firebase-app-provider';
import { useContext } from 'react';

export const useFirebaseApp = () => {
	const app = useContext(FirebaseAppContext);
	if (!app) {
		throw new Error('useFirebaseApp must be used within a FirebaseAppProvider');
	}
	return app;
}

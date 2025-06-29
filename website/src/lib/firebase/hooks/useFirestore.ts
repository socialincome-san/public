'use client';

import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore';
import { useRef } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
const firestoreEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT);

export function useFirestore(): Firestore {
	const connectFirestoreEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const firestore = getFirestore(app);

	if (firestoreEmulatorHost && firestoreEmulatorPort && !connectFirestoreEmulatorCalled.current) {
		console.debug('Using firestore emulator');
		connectFirestoreEmulator(firestore, firestoreEmulatorHost, firestoreEmulatorPort);
		connectFirestoreEmulatorCalled.current = true;
	}

	return firestore;
}

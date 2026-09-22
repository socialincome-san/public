'use client';

import {
	connectFirebaseStorageEmulator,
	createFirebaseStorageReference,
	getFirebaseClientStorage,
	getFirebaseStorageDownloadUrl,
	type FirebaseClientStorage,
	type FirebaseClientStorageReference,
} from '@/integrations/firebase/firebase-client.integration';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);
export const useStorage = () => {
	const connectStorageEmulatorCalled = useRef<true | null>(null);
	const app = useFirebaseApp();
	const storage = getFirebaseClientStorage(app);

	useEffect(() => {
		if (storageEmulatorHost && storageEmulatorPort && connectStorageEmulatorCalled.current === null) {
			console.debug('Using storage emulator');
			connectFirebaseStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
			connectStorageEmulatorCalled.current = true;
		}
	}, [storage]);

	return storage;
};

export const createStorageReference = (storage: FirebaseClientStorage, path: string): FirebaseClientStorageReference =>
	createFirebaseStorageReference(storage, path);

export const useStorageDownloadURL = (storageRef: FirebaseClientStorageReference | undefined) => {
	const [url, setUrl] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(() => Boolean(storageRef));
	const [error, setError] = useState<Error | undefined>(undefined);
	useEffect(() => {
		if (!storageRef) {
			return;
		}

		getFirebaseStorageDownloadUrl(storageRef)
			.then((result) => {
				if (result.success) {
					setUrl(result.data);
				} else {
					setError(new Error(result.error));
				}
			})
			.catch((downloadError: unknown) => {
				setError(downloadError instanceof Error ? downloadError : new Error('Could not download file'));
			})
			.finally(() => setLoading(false));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { data: url, loading, error };
};

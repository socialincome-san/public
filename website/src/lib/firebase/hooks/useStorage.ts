'use client';

import { connectStorageEmulator, getDownloadURL, getStorage, StorageReference } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);

export const useStorage = () => {
	const connectStorageEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const storage = getStorage(app);

	if (storageEmulatorHost && storageEmulatorPort && !connectStorageEmulatorCalled.current) {
		console.debug('Using storage emulator');
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		connectStorageEmulatorCalled.current = true;
	}

	return storage;
};

export const useStorageDownloadURL = (storageRef: StorageReference | undefined) => {
	const [url, setUrl] = useState<string | undefined>(undefined);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | undefined>(undefined);
	useEffect(() => {
		if (storageRef) {
			setLoading(true);
			setError(undefined);
			getDownloadURL(storageRef)
				.then(setUrl)
				.catch(setError)
				.finally(() => setLoading(false));
		} else {
			setLoading(false);
			setUrl(undefined);
			setError(undefined);
		}
	}, []);
	return { data: url, loading, error };
};

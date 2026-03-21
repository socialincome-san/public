'use client';

import { connectStorageEmulator, getDownloadURL, getStorage, StorageReference } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);
export const useStorage = () => {
	const connectStorageEmulatorCalled = useRef<true | null>(null);
	const app = useFirebaseApp();
	const storage = getStorage(app);

	useEffect(() => {
		if (storageEmulatorHost && storageEmulatorPort && connectStorageEmulatorCalled.current === null) {
			console.debug('Using storage emulator');
			connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
			connectStorageEmulatorCalled.current = true;
		}
	}, [storage]);

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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { data: url, loading, error };
};

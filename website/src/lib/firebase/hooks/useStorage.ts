'use client';

import { connectStorageEmulator, getDownloadURL, getStorage, StorageReference } from 'firebase/storage';
import { useEffect, useRef, useState } from 'react';
import { useFirebaseApp } from './useFirebaseApp';

const storageEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST;
const storageEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_PORT);

export function useStorage() {
	const connectStorageEmulatorCalled = useRef(false);
	const app = useFirebaseApp();
	const storage = getStorage(app);

	if (storageEmulatorHost && storageEmulatorPort && !connectStorageEmulatorCalled.current) {
		console.debug('Using storage emulator');
		connectStorageEmulator(storage, storageEmulatorHost, storageEmulatorPort);
		connectStorageEmulatorCalled.current = true;
	}

	return storage;
}

export function useStorageDownloadURL(storageRef: StorageReference | undefined) {
	const [url, setUrl] = useState<string | undefined>(undefined);

	useEffect(() => {
		if (storageRef) {
			getDownloadURL(storageRef).then(setUrl);
		}
	}, [storageRef]);

	return { data: url, loading: !url };
}

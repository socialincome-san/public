'use client';

import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { initializeAnalytics, setConsent, type ConsentSettings, type ConsentStatusString } from 'firebase/analytics';
import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
	connectAuthEmulator,
	getAuth,
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailAndPassword,
	signInWithEmailLink,
	signOut,
	type Auth,
} from 'firebase/auth';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import {
	connectStorageEmulator,
	getDownloadURL,
	getStorage,
	ref,
	type FirebaseStorage,
	type StorageReference,
} from 'firebase/storage';

export type FirebaseClientApp = FirebaseApp;
export type FirebaseClientAuth = Auth;
export type FirebaseClientStorage = FirebaseStorage;
export type FirebaseClientStorageReference = StorageReference;
export type FirebaseConsentStatus = ConsentStatusString;

export const initializeFirebaseClientApp = (): FirebaseClientApp => {
	const existingApp = getApps().at(0);
	if (existingApp) {
		return existingApp;
	}

	return initializeApp({
		apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
		appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
		authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
		measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
		messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
		projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
		storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
	});
};

export const connectFirebaseFunctionsEmulator = (app: FirebaseClientApp, host: string, port: number): void => {
	connectFunctionsEmulator(getFunctions(app, 'europe-west6'), host, port);
};

export const getFirebaseClientAuth = (app: FirebaseClientApp): FirebaseClientAuth => getAuth(app);

export const connectFirebaseAuthEmulator = (auth: FirebaseClientAuth, url: string): void => {
	connectAuthEmulator(auth, url, { disableWarnings: true });
};

export const getFirebaseClientStorage = (app: FirebaseClientApp): FirebaseClientStorage => getStorage(app);

export const connectFirebaseStorageEmulator = (storage: FirebaseClientStorage, host: string, port: number): void => {
	connectStorageEmulator(storage, host, port);
};

export const createFirebaseStorageReference = (
	storage: FirebaseClientStorage,
	path: string,
): FirebaseClientStorageReference => ref(storage, path);

export const getFirebaseStorageDownloadUrl = async (
	storageReference: FirebaseClientStorageReference,
): Promise<ServiceResult<string>> => {
	try {
		return resultOk(await getDownloadURL(storageReference));
	} catch (error) {
		console.error('Could not get Firebase Storage download URL', { error });

		return resultFail('Could not get Firebase Storage download URL');
	}
};

export const signInFirebaseWithEmailAndPassword = async (
	auth: FirebaseClientAuth,
	email: string,
	password: string,
): Promise<ServiceResult<{ idToken: string }>> => {
	try {
		const credential = await signInWithEmailAndPassword(auth, email, password);

		return resultOk({ idToken: await credential.user.getIdToken(true) });
	} catch (error) {
		console.error('Could not sign in to Firebase with email and password', { error });

		return resultFail('Could not sign in');
	}
};

export const sendFirebaseSignInLink = async (
	auth: FirebaseClientAuth,
	email: string,
	url: string,
): Promise<ServiceResult<void>> => {
	try {
		await sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true });

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not send Firebase sign-in link', { error });

		return resultFail('Could not send sign-in link');
	}
};

export const isFirebaseSignInLink = (auth: FirebaseClientAuth, url: string): boolean => isSignInWithEmailLink(auth, url);

export const finishFirebaseSignInWithEmailLink = async (
	auth: FirebaseClientAuth,
	email: string,
	url: string,
): Promise<ServiceResult<{ idToken: string }>> => {
	try {
		const credential = await signInWithEmailLink(auth, email, url);

		return resultOk({ idToken: await credential.user.getIdToken(true) });
	} catch (error) {
		console.error('Could not finish Firebase email-link sign-in', { error });

		return resultFail('Could not sign in');
	}
};

export const signOutFromFirebase = async (auth: FirebaseClientAuth): Promise<ServiceResult<void>> => {
	try {
		await signOut(auth);

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not sign out from Firebase', { error });

		return resultFail('Could not sign out');
	}
};

export const initializeFirebaseAnalytics = (app: FirebaseClientApp): void => {
	initializeAnalytics(app);
};

export const setFirebaseConsent = (mode: FirebaseConsentStatus): void => {
	const settings: ConsentSettings = {
		analytics_storage: mode,
		ad_storage: mode,
		ad_user_data: mode,
		ad_personalization: mode,
		functionality_storage: mode,
		security_storage: mode,
		personalization_storage: mode,
	};
	setConsent(settings);
};

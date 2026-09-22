'use client';

import {
	finishFirebaseSignInWithEmailLink,
	isFirebaseSignInLink,
	sendFirebaseSignInLink,
	signInFirebaseWithEmailAndPassword,
	signOutFromFirebase,
	type FirebaseClientAuth,
} from '@/integrations/firebase/firebase-client.integration';
import type { ServiceResult } from '@/lib/service-result';

export type ClientAuth = FirebaseClientAuth;

export const signInWithEmailAndPassword = async (
	auth: ClientAuth,
	email: string,
	password: string,
): Promise<ServiceResult<{ idToken: string }>> => signInFirebaseWithEmailAndPassword(auth, email, password);

export const sendSignInLink = async (auth: ClientAuth, email: string, url: string): Promise<ServiceResult<void>> =>
	sendFirebaseSignInLink(auth, email, url);

export const isSignInLink = (auth: ClientAuth, url: string): boolean => isFirebaseSignInLink(auth, url);

export const finishSignInWithEmailLink = async (
	auth: ClientAuth,
	email: string,
	url: string,
): Promise<ServiceResult<{ idToken: string }>> => finishFirebaseSignInWithEmailLink(auth, email, url);

export const signOut = async (auth: ClientAuth): Promise<ServiceResult<void>> => signOutFromFirebase(auth);

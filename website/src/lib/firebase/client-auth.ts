'use client';

import {
	finishFirebaseSignInWithEmailLink,
	isFirebaseSignInLink,
	sendFirebaseSignInLink,
	signInFirebaseWithEmailAndPassword,
	signOutFromFirebase,
	type FirebaseClientAuth,
} from '@/integrations/firebase/firebase-client.integration';
import type { Result } from '@/lib/result';

export type ClientAuth = FirebaseClientAuth;

export const signInWithEmailAndPassword = async (
	auth: ClientAuth,
	email: string,
	password: string,
): Promise<Result<{ idToken: string }>> => signInFirebaseWithEmailAndPassword(auth, email, password);

export const sendSignInLink = async (auth: ClientAuth, email: string, url: string): Promise<Result<void>> =>
	sendFirebaseSignInLink(auth, email, url);

export const isSignInLink = (auth: ClientAuth, url: string): boolean => isFirebaseSignInLink(auth, url);

export const finishSignInWithEmailLink = async (
	auth: ClientAuth,
	email: string,
	url: string,
): Promise<Result<{ idToken: string }>> => finishFirebaseSignInWithEmailLink(auth, email, url);

export const signOut = async (auth: ClientAuth): Promise<Result<void>> => signOutFromFirebase(auth);

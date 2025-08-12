'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { FirebaseError } from 'firebase/app';
import {
	fetchSignInMethodsForEmail,
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailLink,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

type UseEmailAuthenticationProps = {
	lang: WebsiteLanguage;
	onLoginSuccess?: (userId: string) => Promise<void>;
};

export const useEmailLogin = ({ lang, onLoginSuccess }: UseEmailAuthenticationProps) => {
	const { auth } = useAuth();
	const [authListenerRegistered, setAuthListenerRegistered] = useState(false);
	const [signingIn, setSigningIn] = useState(false);
	const [sendingEmail, setSendingEmail] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const translator = useTranslator(lang, 'website-login');

	useEffect(() => {
		const url = new URL(window.location.href);
		const continueUrl = url.searchParams.get('continueUrl');

		setSigningIn(continueUrl !== null || url.searchParams.get('email') !== null);

		if (authListenerRegistered) {
			return;
		}

		const unsubscribe = auth.onAuthStateChanged(() => {
			setAuthListenerRegistered(true);

			if (!isSignInWithEmailLink(auth, url.toString())) {
				return;
			}

			const email = new URL(continueUrl ?? window.location.href).searchParams.get('email');

			if (email) {
				void signIn(email);
			} else {
				translator && toast.error(translator.t('error.invalid-email'));
			}
		});

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth, authListenerRegistered, translator]);

	const setServerSession = async () => {
		const user = auth.currentUser;
		if (!user) return false;

		const idToken = await user.getIdToken(true);
		const res = await fetch('/api/session', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ idToken }),
			credentials: 'include',
		});

		return res.ok;
	};

	const signIn = async (email: string) => {
		const url = window.location.href;

		try {
			await createUserIfNotExists(email);
			const { user } = await signInWithEmailLink(auth, email, url);

			const ok = await setServerSession();
			if (!ok) {
				translator && toast.error(translator.t('error.unknown'));
				return;
			}

			if (onLoginSuccess) {
				await onLoginSuccess(user.uid);
			}
		} catch (error: unknown) {
			if (error instanceof FirebaseError) {
				switch (error.code) {
					case 'auth/user-not-found':
						translator && toast.error(translator.t('error.user-not-found'));
						break;
					case 'auth/invalid-email':
						translator && toast.error(translator.t('error.invalid-email'));
						break;
					default:
						translator && toast.error(translator.t('error.unknown'));
				}
			} else {
				translator && toast.error(translator.t('error.unknown'));
			}
		}
	};

	const sendSignInEmail = async (email: string, targetUrl?: string) => {
		setSendingEmail(true);

		const url = new URL(targetUrl || window.location.href);
		url.searchParams.set('email', email);

		const actionCodeSettings = {
			url: url.toString(),
			handleCodeInApp: true,
		};

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			setEmailSent(true);
		} catch (error) {
			translator && toast.error(translator.t('error.unknown'));
		} finally {
			setSendingEmail(false);
		}
	};

	const createUserIfNotExists = async (email: string) => {
		const signInMethods = await fetchSignInMethodsForEmail(auth, email);
		const userExists = signInMethods.length > 0;

		if (userExists) {
			return;
		}

		const response = await fetch('/api/user/create', {
			method: 'POST',
			body: JSON.stringify({ email }),
		});
		if (!response.ok) {
			translator && toast.error(translator.t('error.unknown'));
		}
	};

	return {
		signingIn,
		sendSignInEmail,
		sendingEmail,
		emailSent,
	};
};

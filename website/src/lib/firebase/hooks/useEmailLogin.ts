'use client';

import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { createSessionAction } from '@/lib/server-actions/session-actions';
import { logger } from '@/lib/utils/logger';
import { FirebaseError } from 'firebase/app';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink, signOut } from 'firebase/auth';
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
	}, [auth, authListenerRegistered, translator]);

	const setServerSession = async (): Promise<boolean> => {
		const user = auth.currentUser;
		if (!user) {
			return false;
		}

		try {
			const idToken = await user.getIdToken(true);

			const result = await createSessionAction(idToken);
			return result.success;
		} catch {
			return false;
		}
	};

	const signIn = async (email: string) => {
		const url = window.location.href;

		try {
			const { user } = await signInWithEmailLink(auth, email, url);

			const ok = await setServerSession();
			if (!ok) {
				await signOut(auth).catch(() => {});
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
			logger.error('Error sending sign-in email', { error });
			translator && toast.error(translator.t('error.unknown'));
		} finally {
			setSendingEmail(false);
		}
	};

	return {
		signingIn,
		sendSignInEmail,
		sendingEmail,
		emailSent,
	};
};

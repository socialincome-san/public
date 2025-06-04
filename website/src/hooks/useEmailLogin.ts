import { WebsiteLanguage } from '@/i18n';
import { FirebaseError } from 'firebase/app';
import {
	fetchSignInMethodsForEmail,
	isSignInWithEmailLink,
	sendSignInLinkToEmail,
	signInWithEmailLink,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';
import { useTranslator } from './useTranslator';

type UseEmailAuthenticationProps = {
	lang: WebsiteLanguage;
	onLoginSuccess?: (userId: string) => Promise<void>;
};

export const useEmailLogin = ({ lang, onLoginSuccess }: UseEmailAuthenticationProps) => {
	const auth = useAuth();
	const [authListenerRegistered, setAuthListenerRegistered] = useState(false);
	const [signingIn, setSigningIn] = useState(false);
	const [sendingEmail, setSendingEmail] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const translator = useTranslator(lang, 'website-login');

	useEffect(() => {
		if (authListenerRegistered) {
			return;
		}

		const unsubscribe = auth.onAuthStateChanged(() => {
			setAuthListenerRegistered(true);
			const url = new URL(window.location.href);

			if (signingIn || !isSignInWithEmailLink(auth, url.toString())) {
				return;
			}

			const email = url.searchParams.get('email');

			if (email) {
				void signIn(email);
			} else {
				translator && toast.error(translator.t('error.invalid-email'));
			}
		});

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth, authListenerRegistered, translator, signingIn]);

	const signIn = async (email: string) => {
		setSigningIn(true);
		const url = window.location.href;

		try {
			if (!(await userExists(email))) {
				throw new FirebaseError('auth/user-not-found', 'user not found');
			}
			const { user } = await signInWithEmailLink(auth, email, url);
			onLoginSuccess && (await onLoginSuccess(user.uid));
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
		} finally {
			setSigningIn(false);
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

	const userExists = async (email: string) => {
		const signInMethods = await fetchSignInMethodsForEmail(auth, email);
		return signInMethods.length > 0;
	};

	return {
		signingIn,
		sendSignInEmail,
		sendingEmail,
		emailSent,
		userExists,
	};
};

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
			if (signingIn) {
				return;
			}

			const isSignIn = isSignInWithEmailLink(auth, window.location.href);

			if (!isSignIn) {
				return;
			}

			const email = window.localStorage.getItem('emailForSignIn') ?? prompt(translator?.t('confirm-email'));

			if (!email) {
				translator && toast.error(translator.t('error.invalid-email'));
			}

			if (email) {
				void signIn(email);
			}
		});

		return () => unsubscribe();
	}, [auth, authListenerRegistered, translator, signingIn]);

	const signIn = async (email: string) => {
		setSigningIn(true);
		const url = window.location.href;

		try {
			if (!(await userExists(email))) {
				throw new FirebaseError('auth/user-not-found', 'user not found');
			}
			const { user } = await signInWithEmailLink(auth, email, url);
			window.localStorage.removeItem('emailForSignIn');
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
		const actionCodeSettings = {
			url: targetUrl || window.location.href,
			handleCodeInApp: true,
		};

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			window.localStorage.setItem('emailForSignIn', email);
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

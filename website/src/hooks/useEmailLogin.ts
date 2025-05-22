import { WebsiteLanguage } from '@/i18n';
import { FirebaseError } from 'firebase/app';
import {
	EmailAuthProvider,
	fetchSignInMethodsForEmail,
	isSignInWithEmailLink,
	linkWithCredential,
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
	const [signingIn, setSigningIn] = useState(false);
	const [sendingEmail, setSendingEmail] = useState(false);
	const [loginEmail, setLoginEmail] = useState<string | null>(null);
	const [emailSent, setEmailSent] = useState(false);
	const translator = useTranslator(lang, 'website-login');

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(() => {
			const isSignIn = isSignInWithEmailLink(auth, window.location.href);

			if (!isSignIn) {
				return;
			}

			const email =
				window.localStorage.getItem('emailForSignIn') ?? loginEmail ?? prompt(translator?.t('confirm-email'));

			if (!email) {
				translator && toast.error(translator.t('error.invalid-email'));
			}
			setLoginEmail(email);

			if (email && !signingIn) {
				void signIn(email);
			}
		});

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth, translator]);

	const signIn = async (email: string) => {
		setSigningIn(true);

		try {
			if (auth.currentUser?.isAnonymous) {
				const credentialWithLink = EmailAuthProvider.credentialWithLink(email, window.location.href);
				await linkWithCredential(auth.currentUser, credentialWithLink);
				onLoginSuccess && (await onLoginSuccess(auth.currentUser.uid));
			} else {
				const signInMethods = await fetchSignInMethodsForEmail(auth, email); // check if user exists
				if (signInMethods.length === 0) {
					throw new FirebaseError('auth/user-not-found', 'user not found');
				}
				const { user } = await signInWithEmailLink(auth, email, window.location.href);
				onLoginSuccess && (await onLoginSuccess(user.uid));
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
		} finally {
			window.localStorage.removeItem('emailForSignIn');
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

	return {
		signingIn,
		sendSignInEmail,
		sendingEmail,
		emailSent,
	};
};

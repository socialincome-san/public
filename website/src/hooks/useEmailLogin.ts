import { WebsiteLanguage } from '@/i18n';
import {
	EmailAuthProvider,
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
	const [emailSent, setEmailSent] = useState(false);
	const [isSignInRequest, setIsSignInRequest] = useState(false);
	const translator = useTranslator(lang, 'website-login');

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(() => {
			const isSignIn = isSignInWithEmailLink(auth, window.location.href);
			setIsSignInRequest(isSignIn);

			if (!isSignIn) {
				return;
			}

			const email = window.localStorage.getItem('emailForSignIn') ?? prompt(translator?.t('confirm-email'));

			if (email) {
				void signIn(email);
			}
		});

		return () => unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth]);

	const signIn = async (email: string) => {
		setSigningIn(true);

		try {
			if (auth.currentUser?.isAnonymous) {
				const credentialWithLink = EmailAuthProvider.credentialWithLink(email, window.location.href);
				await linkWithCredential(auth.currentUser, credentialWithLink);
				onLoginSuccess && (await onLoginSuccess(auth.currentUser.uid));
			} else {
				const { user } = await signInWithEmailLink(auth, email, window.location.href);
				console.log('is not anonymous', user.uid);
				onLoginSuccess && (await onLoginSuccess(user.uid));
			}
		} catch (error) {
			console.log('error', (error as any).message);
			translator && toast.error(translator.t('invalid-email'));
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
			translator && toast.error(translator.t('invalid-email'));
		} finally {
			setSendingEmail(false);
		}
	};

	return {
		signIn,
		signingIn,
		sendSignInEmail,
		sendingEmail,
		emailSent,
		isSignInRequest,
	};
};

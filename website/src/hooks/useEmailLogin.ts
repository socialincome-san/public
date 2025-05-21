import { WebsiteLanguage } from '@/i18n';
import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
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
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [isSignIn, setIsSignIn] = useState(false);
	const translator = useTranslator(lang, 'website-login');

	useEffect(() => {
		const isSignIn = isSignInWithEmailLink(auth, window.location.href);
		setIsSignIn(isSignIn);
		const email = window.localStorage.getItem('emailForSignIn');

		if (isSignIn && email) {
			void signIn(email);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth]);

	const signIn = async (email: string) => {
		setLoading(true);
		try {
			const { user } = await signInWithEmailLink(auth, email, window.location.href);
			onLoginSuccess && (await onLoginSuccess(user.uid));
		} catch (error) {
			translator && toast.error(translator.t('invalid-email'));
		} finally {
			window.localStorage.removeItem('emailForSignIn');
			setLoading(false);
		}
	};

	const sendEmailLink = async (email: string, targetUrl?: string) => {
		setLoading(true);
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
			setLoading(false);
		}
	};

	return {
		signIn,
		sendEmailLink,
		loading,
		emailSent,
		isSignIn,
	};
};

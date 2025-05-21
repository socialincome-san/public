import { isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from 'reactfire';

type UseEmailAuthenticationProps = {
	lang: string;
	region: string;
	translations: {
		invalidEmail: string;
		checkEmail: string;
	};
};

export const useEmailAuthentication = ({ lang, region, translations }: UseEmailAuthenticationProps) => {
	const router = useRouter();
	const auth = useAuth();
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [isSignIn, setIsSignIn] = useState(false);

	useEffect(() => {
		const isSignIn = isSignInWithEmailLink(auth, window.location.href);
		const email = window.localStorage.getItem('emailForSignIn');

		if (isSignIn && email) {
			void signIn(email);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [auth]);

	const signIn = async (email: string) => {
		setLoading(true);
		try {
			await signInWithEmailLink(auth, email, window.location.href);
		} catch (error) {
			toast.error(translations.invalidEmail);
		} finally {
			window.localStorage.removeItem('emailForSignIn');
			router.push(`/${lang}/${region}/me`);
		}
	};

	const sendLinkEmail = async (email: string) => {
		setLoading(true);
		const actionCodeSettings = {
			url: window.location.href,
			handleCodeInApp: true,
		};

		try {
			await sendSignInLinkToEmail(auth, email, actionCodeSettings);
			window.localStorage.setItem('emailForSignIn', email);
			setEmailSent(true);
		} catch (error) {
			toast.error(translations.invalidEmail);
		} finally {
			setLoading(false);
		}
	};

	return {
		signIn,
		sendLinkEmail,
		loading,
		emailSent,
		isSignIn,
	};
};

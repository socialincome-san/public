'use client';

import { UpdateUserData } from '@/app/api/user/update/route';
import { useEmailLogin } from '@/hooks/useEmailLogin';
import { WebsiteLanguage } from '@/i18n';
import { Typography } from '@socialincome/ui';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type SignupProps = {
	lang: WebsiteLanguage;
	onSuccessURL: string;
	checkoutSessionId: string;
	translations: {
		updateUserError: string;
		redirecting: string;
	};
};

export default function SignIn({ lang, onSuccessURL, checkoutSessionId, translations }: SignupProps) {
	const router = useRouter();
	useEmailLogin({
		lang,
		onLoginSuccess: async (userId) => {
			const data: UpdateUserData = {
				stripeCheckoutSessionId: checkoutSessionId,
				user: { auth_user_id: userId },
			};
			const response = await fetch('/api/user/update', { method: 'POST', body: JSON.stringify(data) });
			if (!response.ok) {
				toast.error(translations.updateUserError);
			}
			router.push(onSuccessURL);
		},
	});

	return <Typography>{translations.redirecting}</Typography>;
}

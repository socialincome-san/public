'use client';

import { UpdateUserData } from '@/app/api/user/update/route';
import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button, Typography } from '@socialincome/ui';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

type SingleSignOnFormProps = {
	checkoutSessionId: string;
	onSuccessURL: string;
	translations: {
		googleButton: string;
	};
};

export function SingleSignOnForm({ checkoutSessionId, onSuccessURL, translations }: SingleSignOnFormProps) {
	const auth = useAuth();
	const router = useRouter();

	const onGoogleSignUp = async () => {
		const provider = new GoogleAuthProvider();
		signInWithPopup(auth, provider)
			.then(async (result) => {
				const data: UpdateUserData = {
					stripeCheckoutSessionId: checkoutSessionId,
					user: { auth_user_id: result.user.uid },
				};
				fetch('/api/user/update', { method: 'POST', body: JSON.stringify(data) }).then((response) => {
					if (!response.ok) throw new Error('Failed to update auth_user_id');
					router.push(onSuccessURL);
				});
			})
			.catch((error) => {
				console.log(error);
			});
	};
	return (
		<div className="flex flex-col space-y-2">
			<Typography weight="bold" size="xl" className="my-4">
				or...
			</Typography>
			<Button variant="default" onClick={onGoogleSignUp} Icon={SiGoogle}>
				{translations.googleButton}
			</Button>
		</div>
	);
}

'use client';

import { auth } from '@/firebase/client';
import { Button } from '@socialincome/ui';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

type LinkGoogleFormProps = {
	checkoutSessionId: string;
};

export function LinkGoogleForm({ checkoutSessionId }: LinkGoogleFormProps) {
	const onClick2 = async () => {
		const provider = new GoogleAuthProvider();

		signInWithPopup(auth, provider)
			.then(async (result) => {
				const user = result.user;
				await fetch(
					`${window.location.origin}/api/stripe/checkout/success?stripeCheckoutSessionId=${checkoutSessionId}&userId=${user.uid}`,
				);
			})
			.catch((error) => {
				console.log(error);
			});
	};
	return (
		<div>
			<Button onClick={onClick2}>Sign In With Google</Button>
		</div>
	);
}

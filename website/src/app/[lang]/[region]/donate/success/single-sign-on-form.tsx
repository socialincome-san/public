'use client';

import { SiGoogle } from '@icons-pack/react-simple-icons';
import { Button, Typography } from '@socialincome/ui';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useAuth } from 'reactfire';

type LinkGoogleFormProps = {
	checkoutSessionId: string;
	onSuccessURL: string;
};

// TODO: i18n
export function SingleSignOnForm({ checkoutSessionId, onSuccessURL }: LinkGoogleFormProps) {
	const auth = useAuth();
	const router = useRouter();

	const onGoogleSignUp = async () => {
		const provider = new GoogleAuthProvider();

		signInWithPopup(auth, provider)
			.then(async (result) => {
				const user = result.user;
				await fetch(`/api/stripe/checkout/success?stripeCheckoutSessionId=${checkoutSessionId}&userId=${user.uid}`);
				router.push(onSuccessURL);
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
				Sign Up With Google
			</Button>
		</div>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { firestoreAdmin } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import { BaseContainer, Typography } from '@socialincome/ui';
import { redirect } from 'next/navigation';
import { CreateUserForm } from './create-user-form';
import { SingleSignOnForm } from './single-sign-on-form';

// TODO: i18n
export default async function Page({ params: { lang, region }, searchParams }: DefaultPageProps) {
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const checkoutSession = await stripe.checkout.sessions.retrieve(searchParams.stripeCheckoutSessionId);
	const onSuccessURL = `/${lang}/${region}/me/personal-info`;

	const userDoc = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('stripe_customer_id', '==', checkoutSession.customer),
	);
	if (userDoc) redirect(`/${lang}/${region}/me/payments`);

	return (
		<BaseContainer className="pt-16">
			<div className="flex flex-col items-center space-y-3">
				<Typography size="4xl" color="si-yellow" weight="bold">
					Thank you for your Donation
				</Typography>
				<div className="grid w-full grid-cols-1 gap-x-8 md:max-w-4xl md:grid-cols-2">
					<CreateUserForm
						email={checkoutSession.customer_details?.email!}
						checkoutSessionId={searchParams.stripeCheckoutSessionId}
						onSuccessURL={onSuccessURL}
						translations={{
							title: 'Create an account',
							email: 'Email',
							invalidEmail: 'Invalid email',
							password: 'Password',
							passwordValidation: 'Confirm password',
							passwordsMismatch: 'Passwords do not match',
							submitButton: 'Sign Up',
						}}
					/>
					<SingleSignOnForm checkoutSessionId={searchParams.stripeCheckoutSessionId} onSuccessURL={onSuccessURL} />
				</div>
			</div>
		</BaseContainer>
	);
}

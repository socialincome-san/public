import { DefaultPageProps } from '@/app/[lang]/[country]';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { BaseContainer, Typography } from '@socialincome/ui';
import { CreateUserForm } from './create-user-form';
import { LinkGoogleForm } from './link-google-form';

export default async function Page({ searchParams }: DefaultPageProps) {
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const checkoutSession = await stripe.checkout.sessions.retrieve(searchParams.stripeCheckoutSessionId);

	return (
		<BaseContainer className="min-h-screen">
			<div className="flex flex-col items-center space-y-3">
				<Typography size="4xl" color="accent" weight="bold">
					Thank you
				</Typography>
				<CreateUserForm
					email={checkoutSession.customer_details?.email!}
					checkoutSessionId={searchParams.stripeCheckoutSessionId}
					translations={{
						invalidEmail: 'Invalid email',
						title: 'Create an account',
						password: 'Password',
						submitButton: 'Create account',
					}}
				/>
				<LinkGoogleForm checkoutSessionId={searchParams.stripeCheckoutSessionId} />
			</div>
		</BaseContainer>
	);
}

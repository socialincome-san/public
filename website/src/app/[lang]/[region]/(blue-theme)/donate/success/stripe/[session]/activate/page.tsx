import { SingleSignOnForm } from '@/app/[lang]/[region]/(blue-theme)/donate/success/stripe/[session]/activate/single-sign-on-form';
import { StripeSuccessPageProps } from '@/app/[lang]/[region]/(blue-theme)/donate/success/stripe/[session]/page';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Card, Typography } from '@socialincome/ui';
import { CreateUserForm } from './create-user-form';

export default async function Page({ params: { lang, region, session } }: StripeSuccessPageProps) {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-donate' });
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	const checkoutSession = await stripe.checkout.sessions.retrieve(session);
	const onSuccessURL = `/${lang}/${region}/me/personal-info`;

	return (
		<div className="mx-auto flex max-w-3xl flex-col space-y-8">
			<Typography size="4xl" color="accent" weight="bold">
				Activate your Account
			</Typography>
			<Card>
				<div className="grid w-full grid-cols-1 gap-x-8 p-4 md:max-w-4xl md:grid-cols-2">
					<CreateUserForm
						email={checkoutSession.customer_details?.email!}
						checkoutSessionId={session}
						onSuccessURL={onSuccessURL}
						translations={{
							title: translator.t('success.activation-form.title'),
							email: translator.t('success.activation-form.email'),
							invalidEmail: translator.t('success.activation-form.invalid-email'),
							password: translator.t('success.activation-form.password'),
							passwordConfirm: translator.t('success.activation-form.password-confirm'),
							passwordsMismatch: translator.t('success.activation-form.passwords-mismatch'),
							submitButton: translator.t('success.activation-form.submit-button'),
						}}
					/>
					<SingleSignOnForm
						checkoutSessionId={session}
						onSuccessURL={onSuccessURL}
						translations={{
							googleButton: translator.t('success.activation-form.google-button'),
						}}
					/>
				</div>
			</Card>
		</div>
	);
}

import { DefaultParams } from '@/app/[lang]/[region]';
import { SuccessForm } from '@/app/[lang]/[region]/(blue-theme)/donate/success/stripe/[session]/success-form';
import { firestoreAdmin } from '@/firebase-admin';
import { initializeStripe } from '@socialincome/shared/src/stripe';
import { CountryCode } from '@socialincome/shared/src/types/country';
import { USER_FIRESTORE_PATH, User } from '@socialincome/shared/src/types/user';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Card, CardContent, CardHeader, Typography } from '@socialincome/ui';
import { redirect } from 'next/navigation';

interface StripeSuccessPageParams extends DefaultParams {
	session: string;
}

export interface StripeSuccessPageProps {
	params: Promise<StripeSuccessPageParams>;
}

export default async function Page({ params }: StripeSuccessPageProps) {
	const { lang, region, session } = await params;

	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-donate' });
	const stripe = initializeStripe(process.env.STRIPE_SECRET_KEY!);
	// The stripeCheckoutSessionId search param is defined in the donation form and passed to the Stripe checkout session.
	const checkoutSession = await stripe.checkout.sessions.retrieve(session);

	const userDoc = await firestoreAdmin.findFirst<User>(USER_FIRESTORE_PATH, (q) =>
		q.where('stripe_customer_id', '==', checkoutSession.customer),
	);
	if (userDoc?.exists && userDoc.get('auth_user_id')) redirect(`/${lang}/${region}/me/contributions`);

	return (
		<div className="mx-auto flex max-w-3xl flex-col space-y-8">
			<Typography size="4xl" color="accent" weight="bold">
				{translator.t('success.title')}
			</Typography>
			<Card className="theme-default bg-white">
				<CardHeader>
					<Typography weight="bold" size="xl" className="my-4">
						{translator.t('success.user-form.title')}
					</Typography>
				</CardHeader>
				<CardContent>
					<SuccessForm
						lang={lang}
						region={region}
						stripeCheckoutSessionId={checkoutSession.id}
						firstname={checkoutSession.customer_details?.name?.split(' ')[0] || undefined}
						lastname={checkoutSession.customer_details?.name?.split(' ')[1] || undefined}
						country={(checkoutSession.customer_details?.address?.country as CountryCode) || undefined}
						email={checkoutSession.customer_details?.email || undefined}
						translations={{
							firstname: translator.t('success.user-form.firstname'),
							lastname: translator.t('success.user-form.lastname'),
							email: translator.t('success.user-form.email'),
							country: translator.t('success.user-form.country'),
							gender: translator.t('success.user-form.gender'),
							referral: translator.t('success.user-form.referral'),
							acceptTermsAndConditions: translator.t('success.user-form.accept-terms-and-conditions'),
							referrals: {
								familyfriends: translator.t('success.user-form.referrals.familyfriends'),
								work: translator.t('success.user-form.referrals.work'),
								socialmedia: translator.t('success.user-form.referrals.socialmedia'),
								media: translator.t('success.user-form.referrals.media'),
								presentation: translator.t('success.user-form.referrals.presentation'),
								other: translator.t('success.user-form.referrals.other'),
							},
							submitButton: translator.t('success.user-form.submit-button'),
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

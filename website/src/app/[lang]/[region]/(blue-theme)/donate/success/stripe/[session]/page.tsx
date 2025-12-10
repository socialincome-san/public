import { DefaultParams } from '@/app/[lang]/[region]';
import { SuccessForm } from '@/app/[lang]/[region]/(blue-theme)/donate/success/stripe/[session]/success-form';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { StripeService } from '@/lib/services/stripe/stripe.service';
import { CountryCode } from '@/lib/types/country';
import { Card, CardContent, CardHeader, Typography } from '@socialincome/ui';
import { redirect } from 'next/navigation';

interface StripeSuccessPageParams extends DefaultParams {
	session: string;
}

interface StripeSuccessPageProps {
	params: Promise<StripeSuccessPageParams>;
}

export default async function Page({ params }: StripeSuccessPageProps) {
	const { lang, region, session } = await params;

	const translator = await Translator.getInstance({ language: lang as WebsiteLanguage, namespaces: 'website-donate' });

	const stripeService = new StripeService();
	const sessionResult = await stripeService.getCheckoutSession(session);
	if (!sessionResult.success) {
		throw new Error(sessionResult.error);
	}

	const checkoutSession = sessionResult.data;

	const contributorResult = await stripeService.getContributorFromCheckoutSession(checkoutSession);
	if (!contributorResult.success) {
		throw new Error(contributorResult.error);
	}

	if (contributorResult.data && !contributorResult.data.needsOnboarding) {
		redirect(`/${lang}/${region}/dashboard/contributions`);
	}

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
						lang={lang as WebsiteLanguage}
						onSuccessURL={`/${lang}/${region}/dashboard/contributions`}
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
							updateUserError: translator.t('success.user-form.update-user-error'),
						}}
					/>
				</CardContent>
			</Card>
		</div>
	);
}

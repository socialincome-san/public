import { StripeSuccessPageProps } from '@/app/[lang]/[region]/(blue-theme)/donate/success/stripe/[session]/page';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Card, Typography } from '@socialincome/ui';
import PostDonationSignIn from './post-donation-sign-in';

export default async function Page({ params }: StripeSuccessPageProps) {
	const { lang, region, session } = await params;

	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-donate' });
	const onSuccessURL = `/${lang}/${region}/me/personal-info`;

	return (
		<div className="mx-auto flex max-w-3xl flex-col space-y-8">
			<Typography size="4xl" color="accent" weight="bold">
				{translator.t('success.complete.title')}
			</Typography>
			<Card className="p-4">
				<PostDonationSignIn
					lang={lang}
					onSuccessURL={onSuccessURL}
					checkoutSessionId={session}
					translations={{
						updateUserError: translator.t('success.complete.updateUserError'),
						completeMessage: translator.t('success.complete.message'),
						redirecting: translator.t('success.complete.redirecting'),
					}}
				/>
			</Card>
		</div>
	);
}

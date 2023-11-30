import { DefaultPageProps } from '@/app/[lang]/[region]';
import { DonationForm } from '@/app/[lang]/[region]/donate/individual/donation-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer } from '@socialincome/ui';

export default async function Page({ params: { lang, region }, searchParams }: DefaultPageProps) {
	const amount = Number(searchParams.amount) || undefined;
	const translator = await Translator.getInstance({ language: lang, namespaces: ['website-donate'] });

	return (
		<BaseContainer className="mx-auto max-w-5xl pt-16">
			<DonationForm
				amount={amount}
				lang={lang}
				region={region}
				translations={{
					title: translator.t('title'),
					amount: translator.t('amount'),
					howToPay: translator.t('how-to-pay'),
					buttonText: translator.t('button-text'),
					monthly: translator.t('donation-interval.1.title'),
					quarterly: translator.t('donation-interval.3.title'),
					yearly: translator.t('donation-interval.12.title'),
					donationImpact: {
						yourMonthlyContribution: translator.t('donation-impact.monthly-contribution'),
						directPayout: translator.t('donation-impact.direct-payout'),
						yourImpact: translator.t('donation-impact.your-impact'),
					},
				}}
			/>
		</BaseContainer>
	);
}

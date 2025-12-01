import { DefaultPageProps } from '@/app/[lang]/[region]';
import { DonationForm } from '@/app/[lang]/[region]/(blue-theme)/donate/individual/donation-form';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, linkCn } from '@socialincome/ui';
import Link from 'next/link';

export default async function Page(props: DefaultPageProps) {
	const searchParams = await props.searchParams;
	const params = await props.params;

	const { lang, region } = params;

	const amount = Number(searchParams.amount) || undefined;
	const translator = await Translator.getInstance({
		language: lang as WebsiteLanguage,
		namespaces: ['website-donate'],
	});

	return (
		<BaseContainer className="mx-auto max-w-5xl">
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
					paymentType: {
						title: translator.t('payment-type.title'),
						creditCard: translator.t('payment-type.credit-card'),
						bankTransfer: translator.t('payment-type.bank-transfer'),
						creditCardDescription: translator.t('payment-type.credit-card-description'),
						bankTransferDescription: translator.t('payment-type.bank-transfer-description'),
					},
					bankTransfer: {
						firstName: translator.t('success.user-form.firstname'),
						lastName: translator.t('success.user-form.lastname'),
						email: translator.t('success.user-form.email'),
						generateQrBill: translator.t('bank-transfer.generate-qr-bill'),
						standingOrderQrInfo: translator.t('bank-transfer.standing-order-qr-info'),
						confirmPayment: translator.t('bank-transfer.confirm-payment'),
						paymentSuccess: translator.t('bank-transfer.payment-success'),
						loginLink: translator.t('bank-transfer.login-link'),
						profileLink: translator.t('bank-transfer.profile-link'),
						processing: translator.t('bank-transfer.processing'),
						generating: translator.t('bank-transfer.generating'),
						errors: {
							emailRequired: translator.t('bank-transfer.errors.emailRequired'),
							emailInvalid: translator.t('bank-transfer.errors.emailInvalid'),
							qrBillError: translator.t('bank-transfer.errors.qrBillError'),
							paymentFailed: translator.t('bank-transfer.errors.paymentFailed'),
						},
					},
				}}
			/>
			<div className="mt-4 hover:underline">
				<Link className={linkCn()} href={`/${lang}/${region}/donate/one-time`}>
					{translator.t('one-time-donation')}
				</Link>
			</div>
		</BaseContainer>
	);
}

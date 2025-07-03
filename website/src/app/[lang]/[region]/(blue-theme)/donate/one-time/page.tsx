import { DefaultPageProps } from '@/app/[lang]/[region]';
import { DonationInterval } from '@/components/donation/donation-interval';
import { GenericDonationForm } from '@/components/donation/generic-donation-form';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { BaseContainer, Typography } from '@socialincome/ui';

export default async function Page(props: DefaultPageProps) {
	const params = await props.params;

	const { lang, region } = params;

	const translator = await Translator.getInstance({ language: lang, namespaces: 'website-donate' });
	return (
		<BaseContainer className="mx-auto flex max-w-3xl flex-col py-8 md:py-16">
			<div className="flex flex-col items-center">
				<Typography size="5xl" weight="bold" color="accent">
					{translator.t('one-time.title')}
				</Typography>
				<Typography size="3xl" weight="medium" className="mt-4">
					{translator.t('one-time.subtitle')}
				</Typography>
				<div className="text-popover-foreground mt-16 w-full">
					<GenericDonationForm
						defaultInterval={DonationInterval.OneTime}
						lang={lang}
						region={region}
						translations={{
							oneTime: translator.t('donation-interval.0.title'),
							monthly: translator.t('donation-interval.1.title'),
							amount: translator.t('amount'),
							submit: translator.t('button-text-short'),
							paymentType: {
								creditCard: translator.t('payment-type.credit-card'),
								bankTransfer: translator.t('payment-type.bank-transfer'),
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
				</div>
			</div>
		</BaseContainer>
	);
}

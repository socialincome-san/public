import { DonationInterval } from '@/components/donation/donation-interval';
import { GenericDonationForm } from '@/components/donation/generic-donation-form';
import { WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { Typography } from '@socialincome/ui';

export function StoryblokCampaignDonate(props: {
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	translator: Translator;
	campaignId?: string;
}) {
	const { translator, region, lang } = props;
	const donationInterval = DonationInterval.Monthly;
	return (
		<div className="bg-primary my-4 rounded-lg p-10">
			<Typography size="3xl" weight="semibold" color="primary-foreground" className="mb-8 mt-0 align-middle">
				<Typography as="span">{translator.t('donate.text-1')}</Typography>
				<Typography className="ml-2" as="span" color="accent">
					{translator.t('donate.text-2')}
				</Typography>
				<Typography className="ml-2" as="span">
					{translator.t('donate.text-3')}
				</Typography>
			</Typography>
			<GenericDonationForm
				defaultInterval={donationInterval}
				lang={lang}
				region={region}
				translations={{
					oneTime: translator.t('donation-interval.0.title'),
					monthly: translator.t('donation-interval.1.title'),
					amount: translator.t('amount'),
					submit: translator.t('button-text-short'),
					paymentType: {
						bankTransfer: translator.t('payment-type.bank-transfer'),
						creditCard: translator.t('payment-type.credit-card'),
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
				campaignId={props.campaignId}
			/>
		</div>
	);
}

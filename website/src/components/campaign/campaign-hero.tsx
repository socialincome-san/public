import { MakeDonationForm } from '@/components/make-donation-form';
import { Progress } from '@/components/progress';
import type { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import type { CampaignPage } from '@/lib/services/campaign/campaign.types';

type Props = {
	campaign: CampaignPage;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	translator: Translator;
};

export const CampaignHero = ({ campaign, lang, region, translator }: Props) => {
	const daysLeftLabel =
		campaign.daysLeft >= 0
			? translator.t('campaign.days-left', { context: { count: campaign.daysLeft } })
			: translator.t('campaign.ended', { context: { count: campaign.daysLeft } });

	const checkoutTranslations = {
		title: translator.t('campaign.card-title'),
		oneTime: translator.t('donation-interval.0.title'),
		monthly: translator.t('donation-interval.1.title'),
		submit: translator.t('button-text-short'),
		feeNotice: translator.t('fee-notice'),
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
	};
	const hasGoal = campaign.goal !== null && campaign.goal !== undefined;
	const showProgress = campaign.percentageCollected !== null && campaign.percentageCollected !== undefined;

	return (
		<section className="w-site-width max-w-content mx-auto px-6 py-12 md:py-16">
			<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
				<div className="flex flex-col gap-6">
					<p className="text-muted-foreground text-lg">
						{translator.t('campaign.by', { context: { creator: campaign.creatorName } })}
					</p>
					<h1 className="text-primary text-4xl font-bold xl:text-5xl">{campaign.title}</h1>
					<p className="text-lg text-black">{campaign.description}</p>

					{!hasGoal ? (
						<p className="text-primary text-xl font-semibold">
							{translator.t('campaign.without-goal.collected', {
								context: {
									count: campaign.numberOfContributions,
									amount: campaign.amountCollected,
									currency: campaign.currency,
									total: campaign.goal,
								},
							})}
						</p>
					) : null}

					{showProgress ? (
						<div className="flex flex-col gap-2">
							<div className="text-primary flex justify-between text-sm font-medium">
								<span>
									{translator.t('campaign.with-goal.collected-percentage', {
										context: { percentage: campaign.percentageCollected },
									})}
								</span>
								<span>{translator.t('campaign.with-goal.goal-title')}</span>
							</div>
							<Progress value={campaign.percentageCollected ?? 0} className="h-3" />
							<div className="text-primary flex justify-between text-sm">
								<span>
									{translator.t('campaign.with-goal.collected-amount', {
										context: {
											count: campaign.numberOfContributions,
											amount: campaign.amountCollected,
											currency: campaign.currency,
										},
									})}
								</span>
								<span>
									{translator.t('campaign.with-goal.goal-amount', {
										context: {
											amount: campaign.goal,
											currency: campaign.currency,
										},
									})}
								</span>
							</div>
						</div>
					) : null}

					{campaign.daysLeft < 0 ? (
						<p className="text-destructive text-lg font-medium">
							{translator.t('campaign.ended', { context: { count: campaign.daysLeft } })}
						</p>
					) : null}
				</div>

				{campaign.daysLeft >= 0 ? (
					<div className="flex justify-center lg:justify-end">
						<MakeDonationForm
							lang={lang}
							region={region}
							campaignId={campaign.id}
							daysLeft={campaign.daysLeft}
							daysLeftLabel={daysLeftLabel}
							campaignTranslations={checkoutTranslations}
						/>
					</div>
				) : null}
			</div>
		</section>
	);
};

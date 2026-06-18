import { Translator } from '@/lib/i18n/translator';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { DonationForm } from './donation-form';

type Props = {
	lang: WebsiteLanguage;
	campaignId?: string;
};

export const DonationFormServer = async ({ lang, campaignId }: Props) => {
	const translator = await Translator.getInstance({ language: lang, namespaces: 'donation-wizard' });

	return (
		<DonationForm
			campaignId={campaignId}
			translations={{
				title: translator.t('stepAmount.title'),
				monthlyIncomeLabel: translator.t('stepAmount.monthly-income-label'),
				yourOnePercent: translator.t('stepAmount.your-one-percent'),
				chooseOwnAmount: translator.t('stepAmount.choose-own-amount'),
				other: translator.t('stepAmount.other'),
				customAmountPlaceholder: translator.t('stepAmount.custom-amount-placeholder'),
				monthly: translator.t('stepAmount.monthly'),
				oneTime: translator.t('stepAmount.one-time'),
				donateNow: translator.t('stepAmount.donate-now'),
				donateNowWithAmount: translator.t('stepAmount.donate-now-with-amount'),
			}}
		/>
	);
};

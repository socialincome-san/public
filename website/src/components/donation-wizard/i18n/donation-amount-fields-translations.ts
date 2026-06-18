export type DonationAmountFieldsTranslations = {
	title: string;
	monthlyIncomeLabel: string;
	yourOnePercent: string;
	chooseOwnAmount: string;
	other: string;
	customAmountPlaceholder: string;
	monthly: string;
	oneTime: string;
	donateNow: string;
	donateNowWithAmount: string;
};

type Translate = (key: string) => string;

export const getDonationAmountFieldsTranslations = (t: Translate): DonationAmountFieldsTranslations => ({
	title: t('stepAmount.title'),
	monthlyIncomeLabel: t('stepAmount.monthly-income-label'),
	yourOnePercent: t('stepAmount.your-one-percent'),
	chooseOwnAmount: t('stepAmount.choose-own-amount'),
	other: t('stepAmount.other'),
	customAmountPlaceholder: t('stepAmount.custom-amount-placeholder'),
	monthly: t('stepAmount.monthly'),
	oneTime: t('stepAmount.one-time'),
	donateNow: t('stepAmount.donate-now'),
	donateNowWithAmount: t('stepAmount.donate-now-with-amount'),
});

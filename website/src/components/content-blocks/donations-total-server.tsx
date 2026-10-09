import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getTotalContributionsChfAction } from '@/modules/transparency/transparency.actions';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	currency: WebsiteCurrency;
};

export const ChfDonationsTotalBlock = async ({ blok, lang, currency, totalChf }: Props & { totalChf: number }) => {
	const displayResult = await resolveChfAmountsAction({ amounts: [totalChf], displayCurrency: currency });
	const total = (displayResult.success ? displayResult.data[0] : undefined) ?? { amount: totalChf, currency: 'CHF' };

	return (
		<DonationsTotalBlock
			blok={blok}
			lang={lang}
			currency={currency}
			totalAmount={total.amount}
			totalCurrency={total.currency}
		/>
	);
};

export const DonationsTotalBlockServer = async ({ blok, lang, currency }: Props) => {
	const totalResult = await getTotalContributionsChfAction();

	return (
		<ChfDonationsTotalBlock
			blok={blok}
			lang={lang}
			currency={currency}
			totalChf={totalResult.success ? totalResult.data : 0}
		/>
	);
};

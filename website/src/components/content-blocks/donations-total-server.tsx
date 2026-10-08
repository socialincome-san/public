import { DonationsTotalBlock } from '@/components/content-blocks/donations-total';
import { CurrencySwitch } from '@/components/currency/currency-switch';
import type { DonationsTotal } from '@/generated/storyblok/types/109655/storyblok-components';
import { mapWebsiteCurrencies, WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { resolveChfAmountsAction } from '@/modules/currency-display/currency-display.actions';
import { getTotalContributionsChfAction } from '@/modules/transparency/transparency.actions';

type Props = {
	blok: DonationsTotal;
	lang: WebsiteLanguage;
	region: WebsiteRegion;
};

export const ChfDonationsTotalBlock = async ({ blok, lang, region, totalChf }: Props & { totalChf: number }) => {
	const displayResult = await resolveChfAmountsAction({ amounts: [totalChf] });

	return (
		<CurrencySwitch
			variants={mapWebsiteCurrencies((displayCurrency) => {
				const displayAmount = displayResult.success ? displayResult.data[displayCurrency][0] : undefined;
				const { amount, currency } = displayAmount ?? { amount: totalChf, currency: 'CHF' as const };

				return <DonationsTotalBlock blok={blok} lang={lang} region={region} totalAmount={amount} currency={currency} />;
			})}
		/>
	);
};

export const DonationsTotalBlockServer = async ({ blok, lang, region }: Props) => {
	const totalResult = await getTotalContributionsChfAction();

	return (
		<ChfDonationsTotalBlock blok={blok} lang={lang} region={region} totalChf={totalResult.success ? totalResult.data : 0} />
	);
};

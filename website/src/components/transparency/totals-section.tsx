import { Card } from '@/components/card';
import { getSafeNumberFormatLocale, type WebsiteCurrency, type WebsiteLanguage } from '@/lib/i18n/utils';
import type { ExchangeRates } from '@/lib/services/exchange-rate/exchange-rate.types';
import { services } from '@/lib/services/services';
import type { TransparencyTotals } from '@/lib/services/transparency/transparency.types';
import { formatCurrencyLocale } from '@/lib/utils/string-utils';

type TotalsSectionProps = {
	totals: TransparencyTotals;
	lang: WebsiteLanguage;
	displayCurrency: WebsiteCurrency;
	rates?: ExchangeRates;
};

const formatNumber = (value: number, lang: WebsiteLanguage): string => {
	return new Intl.NumberFormat(lang).format(value);
};

export const TotalsSection = ({ totals, lang, displayCurrency, rates }: TotalsSectionProps) => {
	const { amount: totalContributions, currency } = services.currencyDisplay.resolveFromChf(
		totals.totalContributionsChf,
		displayCurrency,
		rates,
	);
	const locale = getSafeNumberFormatLocale(lang);
	const formattedContributions = formatCurrencyLocale(totalContributions, currency, locale, {
		maximumFractionDigits: 0,
	});

	return (
		<section>
			<h2 className="mb-6 text-2xl font-bold">Overview</h2>
			<div className="grid gap-6 md:grid-cols-3">
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributions</p>
						<p className="text-3xl font-bold">{formattedContributions}</p>
					</div>
				</Card>
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributors</p>
						<p className="text-3xl font-bold">{formatNumber(totals.totalContributors, lang)}</p>
					</div>
				</Card>
				<Card>
					<div className="space-y-2">
						<p className="text-muted-foreground text-sm">Total Contributions Count</p>
						<p className="text-3xl font-bold">{formatNumber(totals.totalContributionsCount, lang)}</p>
					</div>
				</Card>
			</div>
		</section>
	);
};

import type { Transparency } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { DateTime } from 'luxon';

import { CountriesSection } from '@/components/transparency/countries-section';
import { TimeSeriesSection } from '@/components/transparency/time-series-section';
import { TotalsSection } from '@/components/transparency/totals-section';

type Props = {
	blok: Transparency;
	lang: WebsiteLanguage;
};

export const TransparencyBlock = async ({ blok, lang }: Props) => {
	const timeRanges = Array.from({ length: 12 }, (_, i) => {
		const start = DateTime.now()
			.minus({ months: 11 - i })
			.startOf('month');
		const end = start.endOf('month');

		return { start, end };
	});

	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [dataResult, rates] = await Promise.all([
		services.transparency.getTransparencyData(timeRanges),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);

	if (!dataResult.success) {
		return null;
	}

	const data = dataResult.data;

	const resolvedTimeRanges = await Promise.all(
		data.timeRanges.map(async (range) => {
			const { amount, currency } = await services.currencyDisplay.resolveFromChf(range.totalChf, displayCurrency, rates);

			return {
				startIso: range.start.toISO()!,
				total: amount,
				currency,
			};
		}),
	);
	const timeSeriesCurrency = resolvedTimeRanges[0]?.currency ?? 'CHF';

	return (
		<div className="w-site-width max-w-content mx-auto space-y-12 py-12" {...storyblokEditable(blok as SbBlokData)}>
			<TotalsSection totals={data.totals} lang={lang} displayCurrency={displayCurrency} rates={rates} />
			<TimeSeriesSection
				timeRanges={resolvedTimeRanges.map(({ startIso, total }) => ({ startIso, total }))}
				currency={timeSeriesCurrency}
				lang={lang}
			/>
			<CountriesSection countries={data.topCountries} lang={lang} displayCurrency={displayCurrency} rates={rates} />
		</div>
	);
};

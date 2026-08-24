import { BlockWrapper } from '@/components/block-wrapper';
import { DonationGlobeBlock } from '@/components/content-blocks/donation-globe-block';
import { CountriesSection } from '@/components/transparency/countries-section';
import { SummarySection } from '@/components/transparency/summary-section';
import { TimeSeriesSection } from '@/components/transparency/time-series-section';
import { TotalsSection } from '@/components/transparency/totals-section';
import type { Transparency } from '@/generated/storyblok/types/109655/storyblok-components';
import { getWebsiteCurrencyFromCookie } from '@/lib/i18n/get-website-currency';
import type { WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import type { TransparencyFinancialPeriod } from '@/lib/services/transparency/transparency.types';
import { storyblokEditable, type SbBlokData } from '@storyblok/react';
import { DateTime } from 'luxon';

type Props = {
	blok: Transparency;
	lang: WebsiteLanguage;
};

export const TransparencyBlock = async ({ blok, lang }: Props) => {
	const donationGlobeBlocks = blok.donationGlobe?.map((globeBlok) => (
		<DonationGlobeBlock key={globeBlok._uid} blok={globeBlok} lang={lang} />
	));
	const financialPeriod: TransparencyFinancialPeriod = { kind: 'all-time' };
	const timeRanges = Array.from({ length: 12 }, (_, i) => {
		const start = DateTime.now()
			.minus({ months: 11 - i })
			.startOf('month');
		const end = start.endOf('month');

		return { start, end };
	});

	const displayCurrency = await getWebsiteCurrencyFromCookie();
	const [dataResult, rates] = await Promise.all([
		services.transparency.getTransparencyData(timeRanges, financialPeriod),
		services.currencyDisplay.fetchWalletPayoutDisplayRates(displayCurrency),
	]);

	if (!dataResult.success) {
		return donationGlobeBlocks && donationGlobeBlocks.length > 0 ? donationGlobeBlocks : null;
	}

	const data = dataResult.data;
	const { inflowsChf, outflowsChf, reservesChf } = data.financialSummary;
	const inflows = services.currencyDisplay.resolveFromChf(inflowsChf, displayCurrency, rates);
	const outflows = services.currencyDisplay.resolveFromChf(outflowsChf, displayCurrency, rates);
	const reserves = services.currencyDisplay.resolveFromChf(reservesChf, displayCurrency, rates);
	const reserveAccounts = data.reserveAccounts.map(({ amountChf, ...account }) => ({
		...account,
		amount: amountChf === null ? null : services.currencyDisplay.resolveFromChf(amountChf, displayCurrency, rates),
	}));

	const { currency: timeSeriesCurrency } = services.currencyDisplay.resolveFromChf(
		data.timeRanges[0]?.totalChf ?? 0,
		displayCurrency,
		rates,
	);
	const resolvedTimeRanges = data.timeRanges.map((range) => ({
		startIso: range.start.toISO()!,
		total: services.currencyDisplay.resolveFromChf(range.totalChf, displayCurrency, rates).amount,
	}));

	return (
		<>
			{donationGlobeBlocks}
			<BlockWrapper className="space-y-12" {...storyblokEditable(blok as SbBlokData)}>
				<SummarySection
					inflows={inflows}
					outflows={outflows}
					reserves={reserves}
					reserveAccounts={reserveAccounts}
					lang={lang}
				/>
				<TotalsSection totals={data.totals} lang={lang} displayCurrency={displayCurrency} rates={rates} />
				<TimeSeriesSection
					timeRanges={resolvedTimeRanges.map(({ startIso, total }) => ({ startIso, total }))}
					currency={timeSeriesCurrency}
					lang={lang}
				/>
				<CountriesSection countries={data.topCountries} lang={lang} displayCurrency={displayCurrency} rates={rates} />
			</BlockWrapper>
		</>
	);
};

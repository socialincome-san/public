import { DefaultLayoutProps, DefaultParams } from '@/app/[lang]/[region]';
import { websiteCurrencies, WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';
import { Currency } from '@/lib/types/currency';
import { DateTime } from 'luxon';
import { CountriesSection } from './(sections)/countries-section';
import { TimeSeriesSection } from './(sections)/time-series-section';
import { TotalsSection } from './(sections)/totals-section';

export const revalidate = 3600;
export const generateStaticParams = () => websiteCurrencies.map((currency) => ({ currency: currency.toLowerCase() }));

type TransparencyFinancesParams = DefaultParams & { currency: Currency };

export default async function Page({ params }: DefaultLayoutProps<TransparencyFinancesParams>) {
	const { lang, currency } = await params;

	const timeRanges = Array.from({ length: 12 }, (_, i) => {
		const start = DateTime.now()
			.minus({ months: 11 - i })
			.startOf('month');
		const end = start.endOf('month');
		return { start, end };
	});

	const [dataResult, rateResult] = await Promise.all([
		services.transparency.getTransparencyData(timeRanges),
		services.exchangeRate.getLatestRateForCurrency(currency.toUpperCase()),
	]);

	if (!dataResult.success) {
		return <div>Error loading transparency data</div>;
	}

	const exchangeRate = rateResult.success ? rateResult.data.rate : 1;
	const data = dataResult.data;
	const currencyCode = currency.toUpperCase() as WebsiteCurrency;
	const language = lang as WebsiteLanguage;

	const serializedTimeRanges = data.timeRanges.map((range) => ({
		startIso: range.start.toISO()!,
		totalChf: range.totalChf,
	}));

	return (
		<div className="container mx-auto space-y-12 py-12">
			<TotalsSection totals={data.totals} exchangeRate={exchangeRate} currency={currencyCode} lang={language} />
			<TimeSeriesSection
				timeRanges={serializedTimeRanges}
				exchangeRate={exchangeRate}
				currency={currencyCode}
				lang={language}
			/>
			<CountriesSection
				countries={data.topCountries}
				exchangeRate={exchangeRate}
				currency={currencyCode}
				lang={language}
			/>
		</div>
	);
}

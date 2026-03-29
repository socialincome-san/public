import { DefaultParams } from '@/app/[lang]/[region]';
import { websiteCurrencies, WebsiteCurrency, WebsiteLanguage } from '@/lib/i18n/utils';
import { services } from '@/lib/services/services';

import { isValidCurrency } from '@/lib/types/currency';
import { DateTime } from 'luxon';
import { CountriesSection } from './(sections)/countries-section';
import { TimeSeriesSection } from './(sections)/time-series-section';
import { TotalsSection } from './(sections)/totals-section';

export const revalidate = 3600;
export const generateStaticParams = () => websiteCurrencies.map((currency) => ({ currency: currency.toLowerCase() }));

const FIRST_YEAR = 2020;

type TransparencyFinancesParams = DefaultParams & { currency: string };
type TransparencyFinancesPageProps = {
	params: Promise<TransparencyFinancesParams>;
	searchParams: Promise<Record<string, string>>;
};

export default async function Page({ params, searchParams }: TransparencyFinancesPageProps) {
	const { lang, currency } = await params;
	const resolvedSearchParams = await searchParams;

	const currentYear = DateTime.now().year;
	const availableYears = Array.from({ length: currentYear - FIRST_YEAR + 1 }, (_, i) => FIRST_YEAR + i);
	const requestedYear = parseInt(resolvedSearchParams.year, 10);
	const selectedYear = availableYears.includes(requestedYear) ? requestedYear : currentYear;

	const timeRanges = Array.from({ length: 12 }, (_, i) => {
		const start = DateTime.local(selectedYear, i + 1, 1);
		const end = start.endOf('month');

		return { start, end };
	});
	const requestedCurrency = currency.toUpperCase();
	const exchangeCurrency = isValidCurrency(requestedCurrency) ? requestedCurrency : 'USD';

	const [dataResult, rateResult] = await Promise.all([
		services.transparency.getTransparencyData(timeRanges),
		services.read.exchangeRate.getLatestRateForCurrency(exchangeCurrency),
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
		<div className="w-site-width max-w-content mx-auto space-y-12 py-12">
			<TotalsSection totals={data.totals} exchangeRate={exchangeRate} currency={currencyCode} lang={language} />
			<TimeSeriesSection
				timeRanges={serializedTimeRanges}
				exchangeRate={exchangeRate}
				currency={currencyCode}
				lang={language}
				selectedYear={selectedYear}
				availableYears={availableYears}
			/>
			<CountriesSection countries={data.topCountries} exchangeRate={exchangeRate} currency={currencyCode} lang={language} />
		</div>
	);
}

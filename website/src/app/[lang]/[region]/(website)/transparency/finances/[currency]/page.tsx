import { DefaultParams } from '@/app/[lang]/[region]';
import { CurrencyRedirect } from '@/app/[lang]/[region]/(website)/transparency/(components)/currency-redirect';
import { firestoreAdmin } from '@/lib/firebase/firebase-admin';
import { toLocale, websiteCurrencies, WebsiteCurrency } from '@/lib/i18n/utils';
import { Currency } from '@socialincome/shared/src/types/currency';
import {
	ContributionStats,
	ContributionStatsCalculator,
} from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { ExpensesStatsCalculator, ExpenseStats } from '@socialincome/shared/src/utils/stats/ExpensesStatsCalculator';
import { PaymentStats, PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer } from '@socialincome/ui';
import { Section1 } from './section-1';
import { Section2 } from './section-2';
import { Section3 } from './section-3';
import { Section4 } from './section-4';

export const revalidate = 3600; // update once an hour
export const generateStaticParams = () => websiteCurrencies.map((currency) => ({ currency: currency.toLowerCase() }));

interface TransparencyPageParams extends DefaultParams {
	currency: Currency;
}

interface TransparencyPageProps {
	params: Promise<TransparencyPageParams>;
}

export type SectionProps = {
	contributionStats: ContributionStats;
	expensesStats: ExpenseStats;
	params: TransparencyPageParams;
	paymentStats: PaymentStats;
};

export default async function Page(props: TransparencyPageProps) {
	const params = await props.params;
	const getStats = async (currency: Currency) => {
		const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
		const contributionStats = contributionCalculator.allStats();
		const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
		const paymentStats = paymentCalculator.allStats();
		const expensesStatsCalculator = await ExpensesStatsCalculator.build(firestoreAdmin, currency);
		const expensesStats = expensesStatsCalculator.allStats();
		return { contributionStats, expensesStats, paymentStats };
	};
	const currency = params.currency.toUpperCase() as WebsiteCurrency;
	const { contributionStats, expensesStats, paymentStats } = await getStats(currency);
	const currencyLocales = {
		style: 'currency' as keyof Intl.NumberFormatOptionsStyleRegistry,
		currency: params.currency,
		locale: toLocale(params.lang, params.region),
		maximumFractionDigits: 0,
	};
	const sectionProps = { contributionStats, expensesStats, params, paymentStats, currencyLocales };

	return (
		<BaseContainer className="flex flex-col space-y-16">
			<CurrencyRedirect currency={currency} />
			<Section1 {...sectionProps} />
			<Section2 {...sectionProps} />
			<Section3 {...sectionProps} />
			<Section4 {...sectionProps} />
		</BaseContainer>
	);
}

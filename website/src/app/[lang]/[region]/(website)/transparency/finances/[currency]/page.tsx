import { DefaultPageProps, DefaultParams } from '@/app/[lang]/[region]';
import { CurrencyRedirect } from '@/app/[lang]/[region]/(website)/transparency/finances/[currency]/currency-redirect';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion, websiteCurrencies } from '@/i18n';
import { Currency } from '@socialincome/shared/src/types/currency';
import {
	ContributionStats,
	ContributionStatsCalculator,
} from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { ExpenseStats, ExpensesStatsCalculator } from '@socialincome/shared/src/utils/stats/ExpensesStatsCalculator';
import { PaymentStats, PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer } from '@socialincome/ui';
import { Section1 } from './section-1';
import { Section2 } from './section-2';
import { Section3 } from './section-3';
import { Section4 } from './section-4';

export const revalidate = 3600; // update once an hour
export const generateStaticParams = () => websiteCurrencies.map((currency) => ({ currency: currency.toLowerCase() }));

export type TransparencyPageProps = {
	params: {
		country: WebsiteRegion;
		lang: WebsiteLanguage;
		currency: string;
	};
} & DefaultPageProps;

export type SectionProps = {
	params: DefaultParams & { currency: string };
	contributionStats: ContributionStats;
	paymentStats: PaymentStats;
	expensesStats: ExpenseStats;
};

export default async function Page({ params }: TransparencyPageProps) {
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

	return (
		<BaseContainer className="flex flex-col space-y-16">
			<CurrencyRedirect currency={currency} />
			<Section1
				params={params}
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				expensesStats={expensesStats}
			/>
			<Section2
				params={params}
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				expensesStats={expensesStats}
			/>
			<Section3
				params={params}
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				expensesStats={expensesStats}
			/>
			<Section4
				params={params}
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				expensesStats={expensesStats}
			/>
		</BaseContainer>
	);
}

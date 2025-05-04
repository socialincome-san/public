import { DefaultParams } from '@/app/[lang]/[region]';
import { firestoreAdmin } from '@/firebase-admin';
import { Currency } from '@socialincome/shared/src/types/currency';
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer, Typography } from '@socialincome/ui';
import TransparencyCharts from './transparency-charts';

export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));
export const revalidate = 3600; // update once an hour

interface TransparencyPageParams extends DefaultParams {
	currency: Currency;
}

interface TransparencyPageProps {
	params: Promise<TransparencyPageParams>;
}

export default async function Page({ params }: TransparencyPageProps) {
	const { lang, currency } = await params;

	const getStats = async (currency: Currency) => {
		const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
		const contributionStats = contributionCalculator.allStats();
		const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
		const paymentStats = paymentCalculator.allStats();
		return { contributionStats, paymentStats };
	};

	const { contributionStats, paymentStats } = await getStats(currency);

	return (
		<BaseContainer className="min-h-screen">
			<Typography as="h2" size="2xl" weight="medium">
				Total contributions: {contributionStats.totalContributionsAmount}
			</Typography>
			<TransparencyCharts
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				lang={lang}
				currency={currency}
			/>
		</BaseContainer>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[region]';
import { firestoreAdmin } from '@/firebase-admin';
import { WebsiteCurrency, WebsiteLanguage, WebsiteRegion } from '@/i18n';
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer, Typography } from '@socialincome/ui';
import TransparencyCharts from './transparency-charts';

export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));
export const revalidate = 3600; // update once an hour

export type TransparencyPageProps = {
	params: {
		region: WebsiteRegion;
		lang: WebsiteLanguage;
		currency: WebsiteCurrency;
	};
} & DefaultPageProps;

export default async function Page(props: TransparencyPageProps) {
	const getStats = async (currency: string) => {
		const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
		const contributionStats = contributionCalculator.allStats();
		const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
		const paymentStats = paymentCalculator.allStats();
		return { contributionStats, paymentStats };
	};
	const { contributionStats, paymentStats } = await getStats(props.params.currency);

	return (
		<BaseContainer className="min-h-screen">
			<Typography as="h2" size="2xl" weight="medium">
				Total contributions: {contributionStats.totalContributionsAmount}
			</Typography>
			<TransparencyCharts
				contributionStats={contributionStats}
				paymentStats={paymentStats}
				lang={props.params.lang}
				currency={props.params.currency}
			/>
		</BaseContainer>
	);
}

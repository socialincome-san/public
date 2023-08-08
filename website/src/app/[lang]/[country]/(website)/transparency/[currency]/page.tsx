import { DefaultPageProps } from '@/app/[lang]/[country]';
import TransparencyCharts from '@/app/[lang]/[country]/(website)/transparency/[currency]/transparency-charts';
import { ValidCountry, WebsiteLanguage } from '@/i18n';
import { BaseContainer, Stats } from '@socialincome/ui';
import {firestoreAdmin} from "@/firebase/admin";
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import Test from "@/app/[lang]/[country]/(website)/transparency/[currency]/test";

export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));
export const revalidate = 60 // once an hour

export type TransparencyPageProps = {
	params: {
		country: ValidCountry;
		lang: WebsiteLanguage;
		currency: string;
	};
} & DefaultPageProps;

export default async function Page(props: TransparencyPageProps) {
	const getStats = async (currency: string) => {
		console.log('retrieving stats');
		const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
		const contributionStats = contributionCalculator.allStats();
		const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
		const paymentStats = paymentCalculator.allStats();
		console.log('retrieved stats');
		return { contributionStats, paymentStats };
	};

	const { contributionStats, paymentStats } = await getStats(props.params.currency);

	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			{/*<CurrencySwitcher />*/}
			<Stats>
				<Stats.Stat>
					<Stats.Stat.Item variant="title">Total contributions</Stats.Stat.Item>
					<Stats.Stat.Item variant="value">{contributionStats.totalContributions}</Stats.Stat.Item>
				</Stats.Stat>
			</Stats>
			<TransparencyCharts contributionStats={contributionStats} paymentStats={paymentStats} />
		</BaseContainer>
	);
}

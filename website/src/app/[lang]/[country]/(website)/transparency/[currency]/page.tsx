import { DefaultPageProps, DefaultParams } from '@/app/[lang]/[country]';
import { firestoreAdmin } from '@/firebase-admin';
import { ValidCountry, WebsiteLanguage } from '@/i18n';
import {
	ContributionStats,
	ContributionStatsCalculator,
} from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStats, PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer } from '@socialincome/ui';
import { Section1 } from './section-1';
import { Section2 } from './section-2';
import { Section3 } from './section-3';
import { Section4 } from './section-4';

export const revalidate = 3600; // update once an hour
export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));

export type TransparencyPageProps = {
	params: {
		country: ValidCountry;
		lang: WebsiteLanguage;
		currency: string;
	};
} & DefaultPageProps;

export type SectionProps = {
	params: DefaultParams & { currency: string };
	contributionStats: ContributionStats;
	paymentStats: PaymentStats;
};

export default async function Page({ params }: TransparencyPageProps) {
	const getStats = async (currency: string) => {
		const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
		const contributionStats = contributionCalculator.allStats();
		const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
		const paymentStats = paymentCalculator.allStats();
		return { contributionStats, paymentStats };
	};
	const { contributionStats, paymentStats } = await getStats(params.currency.toUpperCase());

	return (
		<BaseContainer className="bg-base-blue">
			<div className="flex flex-col space-y-16">
				<Section1 params={params} contributionStats={contributionStats} paymentStats={paymentStats} />
				<Section2 params={params} contributionStats={contributionStats} paymentStats={paymentStats} />
				<Section3 params={params} contributionStats={contributionStats} paymentStats={paymentStats} />
				<Section4 params={params} contributionStats={contributionStats} paymentStats={paymentStats} />
			</div>
		</BaseContainer>
	);
}

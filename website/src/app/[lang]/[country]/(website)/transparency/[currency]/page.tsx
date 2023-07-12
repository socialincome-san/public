import { DefaultPageProps } from '@/app/[lang]/[country]';
import ContributionStats from '@/app/[lang]/[country]/(website)/transparency/[currency]/contribution-stats';
import { firestoreAdmin } from '@/firebase/admin';
import { ValidCountry, WebsiteLanguage } from '@/i18n';
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';

const getStats = async (currency: string) => {
	const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
	const contributionStats = contributionCalculator.allStats();

	const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
	const paymentStats = paymentCalculator.allStats();
	return { contributionStats, paymentStats };
};

// TODO: support generateStaticParams
// export const generateStaticParams = ({ params }: any) => {
// 	return ['USD', 'CHF'].map((currency) => ({ currency }));
// };

interface FinancesProps extends DefaultPageProps {
	params: {
		country: ValidCountry;
		lang: WebsiteLanguage;
		currency: string;
	};
}

export default async function Page({ params: { currency } }: FinancesProps) {
	const stats = await getStats(currency);

	return (
		<div>
			{/*<CurrencySwitcher />*/}
			<ContributionStats currency={currency} contributionStats={stats.contributionStats} />
		</div>
	);
}

import { DefaultPageProps } from '@/app/[lang]/[country]';
import { contributionStats } from '@/app/[lang]/[country]/(website)/transparency/[currency]/contribution-stats';
import { paymentStats } from '@/app/[lang]/[country]/(website)/transparency/[currency]/payment-stats';
import { firestoreAdmin } from '@/firebase/admin';
import { ValidCountry, WebsiteLanguage } from '@/i18n';
import { ContributionStatsCalculator } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { BaseContainer, Typography } from '@socialincome/ui';
import flagCH from 'flag-icons/flags/4x3/ch.svg';
import flagSL from 'flag-icons/flags/4x3/sl.svg';
import Image from 'next/image';

export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));

export type TransparencyPageProps = {
	params: {
		country: ValidCountry;
		lang: WebsiteLanguage;
		currency: string;
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

	// TODO: Uncomment when deleting ./payment-stats.ts and ./contribution-stats.ts files
	// const { contributionStats, paymentStats } = await getStats(props.params.currency);

	return (
		<BaseContainer className="bg-base-blue min-h-screen">
			<Image className="w-8" src={flagSL} alt="Sierra Leone Flag" />
			<Image className="w-8" src={flagCH} alt="Swiss Flag" />
			<Typography size="2xl">Contribution Stats</Typography>
			{JSON.stringify(contributionStats)}
			<Typography size="2xl">Payment Stats</Typography>
			{JSON.stringify(paymentStats)}
		</BaseContainer>
	);
}

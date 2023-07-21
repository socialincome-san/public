import { DefaultPageProps } from '@/app/[lang]/[country]';
import { getStats } from '@/app/[lang]/[country]/(website)/transparency/[currency]/get-stats';
import TransparencyCharts from '@/app/[lang]/[country]/(website)/transparency/[currency]/transparency-charts';
import { ValidCountry, WebsiteLanguage } from '@/i18n';
import { BaseContainer, Stats } from '@socialincome/ui';

export const generateStaticParams = () => ['USD', 'CHF'].map((currency) => ({ currency: currency.toLowerCase() }));

export type TransparencyPageProps = {
	params: {
		country: ValidCountry;
		lang: WebsiteLanguage;
		currency: string;
	};
} & DefaultPageProps;

export default async function Page(props: TransparencyPageProps) {
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
			<TransparencyCharts contributionStats={contributionStats} paymentStats={paymentStats} {...props} />
		</BaseContainer>
	);
}

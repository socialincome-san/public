import { Card, CardContent, CardHeader } from '@mui/material';
import { getOrInitializeApp } from '@socialincome/shared/src/firebase/app';
import { FirestoreAdmin } from '@socialincome/shared/src/firebase/FirestoreAdmin';
import {
	ContributionStats,
	ContributionStatsCalculator,
} from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStats, PaymentStatsCalculator } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { displayedCurrencies } from '../../../../shared/src/utils/currency';
import CurrencySwitcher from '../../../components/CurrencySwitcher';
import Layout from '../../../components/Layout';

interface Props {
	currency: string;
	contributionStats: ContributionStats;
	paymentStats: PaymentStats;
}

export default function Finances({ currency, contributionStats, paymentStats }: Props) {
	const { t } = useTranslation('website-finances');

	return (
		<Layout title={t('finances.title')}>
			<CurrencySwitcher currentCurrency={currency} supportedCurrencies={displayedCurrencies} />
			<Card sx={{ marginTop: 2 }}>
				<CardHeader title={t('finances.totalContributionsByMonthAndType')} />
				<CardContent>
					<ResponsiveContainer width={'99%'} height={300}>
						<AreaChart
							data={contributionStats.totalContributionsByMonthAndType}
							margin={{
								top: 5,
								bottom: 5,
								right: 5,
								left: 5,
							}}
						>
							<XAxis dataKey="month" />
							<YAxis />
							<Tooltip
								/*@ts-ignore*/
								formatter={(value, name) => {
									const key =
										name === 'institutional'
											? 'finances.totalInstitutionalContributionsByMonthTooltip'
											: 'finances.totalIndividualContributionsByMonthTooltip';
									return [t(key, { currency, value }), null];
								}}
							/>
							<Area dataKey="individual" stackId="1" stroke="#3980d0" fill="#3980d0" />
							<Area dataKey="institutional" stackId="1" stroke="#FBC700" fill="#FBC700" />
						</AreaChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
			<Card sx={{ marginTop: 2 }}>
				<CardHeader title={t('finances.totalPayout')} />
				<CardContent>
					<ResponsiveContainer width={'99%'} height={300}>
						<LineChart
							data={paymentStats.cumulativePaymentsByMonth}
							margin={{
								top: 5,
								bottom: 5,
								right: 5,
								left: 5,
							}}
						>
							<XAxis dataKey="month" />
							<YAxis />
							{/*@ts-ignore*/}
							<Tooltip formatter={(value) => [t('finances.totalPayoutTooltip', { currency, value }), null]} />
							<Line dataKey="payment" stroke="#3980d0" />
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
			<Card sx={{ marginTop: 2 }}>
				<CardHeader title={t('finances.totalRecipients')} />
				<CardContent>
					<ResponsiveContainer width={'99%'} height={300}>
						<LineChart
							data={paymentStats.cumulativeRecipientsByMonth}
							margin={{
								top: 5,
								bottom: 5,
								right: 5,
								left: 5,
							}}
						>
							<XAxis dataKey="month" />
							<YAxis />
							{/*@ts-ignore*/}
							<Tooltip formatter={(value) => [t('finances.totalRecipientsTooltip', { currency, value }), null]} />
							<Line dataKey="recipients" stroke="#3980d0" />
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
			<Card sx={{ marginTop: 2, marginBottom: 2 }}>
				<CardHeader title={t('finances.monthlyPayoutPerSocialIncome')} />
				<CardContent>
					<ResponsiveContainer width={'99%'} height={300}>
						<LineChart
							data={paymentStats.meanPaymentsByMonth}
							margin={{
								top: 5,
								bottom: 5,
								right: 5,
								left: 5,
							}}
						>
							<XAxis dataKey="month" />
							<YAxis yAxisId={'payment'} />
							<YAxis yAxisId={'paymentSle'} orientation={'right'} />
							<Tooltip
								/*@ts-ignore*/
								formatter={(value, name) => {
									const c = name === 'payment' ? currency : 'SLE';
									return [t('finances.monthlyPayoutPerSocialIncomeTooltip', { currency: c, value }), null];
								}}
							/>
							<Line dataKey="payment" yAxisId={'payment'} stroke="#3980d0" />
							<Line dataKey="paymentSle" yAxisId={'paymentSle'} stroke="#FBC700" />
						</LineChart>
					</ResponsiveContainer>
				</CardContent>
			</Card>
		</Layout>
	);
}

/**
 * Incrementally retrieve the stats from firestore.
 * getStaticProps are only executed at build time or incrementally on the server. It's therefore safe to
 * use the admin firestore directly.
 */
export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
	const currency = (params?.currency as string).toUpperCase();
	const firestoreAdmin = new FirestoreAdmin(getOrInitializeApp());
	const contributionCalculator = await ContributionStatsCalculator.build(firestoreAdmin, currency);
	const contributionStats = contributionCalculator.allStats();

	const paymentCalculator = await PaymentStatsCalculator.build(firestoreAdmin, currency);
	const paymentStats = paymentCalculator.allStats();
	return {
		props: {
			...(await serverSideTranslations(locale!, ['website-finances'])),
			currency,
			contributionStats: contributionStats,
			paymentStats: paymentStats,
		},
		revalidate: 60 * 60 * 2, // rebuild these pages every second hour on the server
	};
};

/**
 * Routes for all supported currencies
 */
export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
	return {
		paths: displayedCurrencies.flatMap((currency) => {
			return locales!.map((locale) => {
				return {
					params: {
						currency: currency.toLowerCase(),
					},
					locale: locale,
				};
			});
		}),
		fallback: false,
	};
};

'use client';

import { TransparencyPageProps } from '@/app/[lang]/[country]/(website)/transparency/[currency]/page';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { ContributionStats } from '@socialincome/shared/src/utils/stats/ContributionStatsCalculator';
import { PaymentStats } from '@socialincome/shared/src/utils/stats/PaymentStatsCalculator';
import { Typography } from '@socialincome/ui';
import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type ContributionStatsProps = {
	contributionStats: ContributionStats;
	paymentStats: PaymentStats;
} & TransparencyPageProps;

export default function TransparencyCharts({
	params: { lang, currency },
	contributionStats,
	paymentStats,
}: ContributionStatsProps) {
	const { data: translator } = useQuery(
		[lang],
		async () =>
			Translator.getInstance({
				language: lang,
				namespaces: ['website-transparency'],
			}),
		{
			staleTime: Infinity, // never refetch
		},
	);
	console.log(contributionStats);
	console.log(paymentStats);

	return (
		<div className="grid grid-cols-1 gap-8  lg:grid-cols-2">
			<div className="flex flex-col space-y-4">
				<Typography as="h2" size="2xl" weight="medium">
					Contributions by type
				</Typography>
				<ResponsiveContainer aspect={16 / 9}>
					<AreaChart data={contributionStats.totalContributionsByMonthAndType}>
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip
							formatter={(value, name) => {
								return [`${name}: ${value}`, null];
							}}
						/>
						<Area dataKey="individual" stackId="1" stroke="#3980d0" fill="#3980d0" />
						<Area dataKey="institutional" stackId="1" stroke="#FBC700" fill="#FBC700" />
					</AreaChart>
				</ResponsiveContainer>
			</div>

			<div className="flex flex-col space-y-4">
				<Typography as="h2" size="2xl" weight="medium">
					Contributions by month
				</Typography>
				<ResponsiveContainer aspect={16 / 9}>
					<BarChart data={contributionStats.totalContributionsByMonth}>
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip cursor={false} />
						<Bar dataKey="amount" className="fill-primary" />
					</BarChart>
				</ResponsiveContainer>
			</div>

			<div className="flex flex-col space-y-4">
				<Typography as="h2" size="2xl" weight="medium">
					Contributions by month
				</Typography>
				<ResponsiveContainer aspect={16 / 9}>
					<LineChart data={paymentStats.cumulativePaymentsByMonth}>
						<XAxis dataKey="month" />
						<YAxis />
						<Tooltip
							formatter={(value) => [translator?.t('finances.totalPayoutTooltip', { context: { currency, value } })]}
						/>
						<Line dataKey="payment" stroke="#3980d0" />
					</LineChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}

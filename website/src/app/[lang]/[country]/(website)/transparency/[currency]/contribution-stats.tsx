'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function ContributionStats({ currency, contributionStats }: any) {
	return (
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
					formatter={(value, name) => {
						return [`${name}: ${value}`, null];
					}}
				/>
				<Area dataKey="individual" stackId="1" stroke="#3980d0" fill="#3980d0" />
				<Area dataKey="institutional" stackId="1" stroke="#FBC700" fill="#FBC700" />
			</AreaChart>
		</ResponsiveContainer>
	);
}

'use client';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export interface ChartData {
	name: string;
	value: number;
}

function BarchartSurveyResponseComponent({ data }: { data: ChartData[] }) {
	const barHeight = 30;
	const chartHeight = data.length * barHeight + 40;

	let fillColor = 'hsl(var(--foreground))';

	const customLabel = (props: any) => {
		const { x, y, width, value } = props;
		return (
			<text
				aria-label={value}
				x={x + width + 10}
				y={y + barHeight / 2 + 3}
				fontSize={15}
				fill={fillColor}
				textAnchor="start"
			>
				<title>{value}</title>
				{value}
			</text>
		);
	};

	return (
		<ResponsiveContainer height={chartHeight}>
			<BarChart
				data={data}
				className="before:to-background before:pointer-events-none before:absolute before:inset-y-0 before:right-0 before:w-10 before:bg-gradient-to-r before:from-transparent before:content-['']"
				layout="vertical"
				margin={{ top: 20, right: 100, bottom: 20, left: 20 }}
				barGap={0}
				barCategoryGap="0%"
			>
				<Bar barSize={barHeight} dataKey="value" fill={fillColor} radius={[4, 4, 4, 4]}>
					<LabelList dataKey="name" position="right" content={customLabel} />
				</Bar>
				<XAxis type="number" hide />
				<YAxis
					type="category"
					dataKey="value"
					axisLine={false}
					tickLine={false}
					className={'font-medium'}
					tick={{ fill: fillColor }}
					tickFormatter={(value) => `${value}%`}
					minTickGap={1}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
}

export default BarchartSurveyResponseComponent;

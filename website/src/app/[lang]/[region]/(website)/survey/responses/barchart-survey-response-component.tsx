'use client';
import { Component } from 'react';
import { Bar, BarChart, LabelList, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import './opacity.css';
export interface ChartData {
	name: string;
	value: number;
}

export default class BarchartSurveyResponseComponent extends Component<{ data: ChartData[] }> {
	render() {
		const { data } = this.props;
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
			<ResponsiveContainer className={'survey-chart'} height={chartHeight}>
				<BarChart
					data={data}
					layout="vertical"
					margin={{ top: 20, right: 100, bottom: 20, left: 20 }}
					barGap={0}
					barCategoryGap="0%"
				>
					<Bar barSize={barHeight} dataKey="value" fill={fillColor}>
						<LabelList dataKey="name" position="right" content={customLabel} />
					</Bar>
					<XAxis type="number" hide />
					<YAxis
						type="category"
						dataKey="value"
						axisLine={false}
						tickLine={false}
						className={'font-bold'}
						tick={{ fill: fillColor }}
						tickFormatter={(value) => `${value}%`}
						minTickGap={1}
					/>
				</BarChart>
			</ResponsiveContainer>
		);
	}
}

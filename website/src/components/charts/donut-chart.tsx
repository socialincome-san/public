type DonutChartOption = {
	id: string;
	label: string;
	percentage: number;
	weight: number;
};

type DonutChartProps = {
	options: DonutChartOption[];
	emptyLabel: string;
};

export const DonutChart = ({ options, emptyLabel }: DonutChartProps) => {
	const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
	const topOption = options[0];
	const chartColors = [
		'hsl(var(--chart-1))',
		'hsl(var(--chart-2))',
		'hsl(var(--chart-3))',
		'hsl(var(--chart-4))',
		'hsl(var(--chart-5))',
	];

	const gradientStops = options.reduce<{ stops: string[]; accumulated: number }>(
		(state, option, index) => {
			if (option.weight === 0 || totalWeight === 0) {
				return state;
			}

			const segmentStart = (state.accumulated / totalWeight) * 100;
			const nextAccumulated = state.accumulated + option.weight;
			const segmentEnd = (nextAccumulated / totalWeight) * 100;
			const color = chartColors[index % chartColors.length];

			return {
				stops: [...state.stops, `${color} ${segmentStart}% ${segmentEnd}%`],
				accumulated: nextAccumulated,
			};
		},
		{ stops: [], accumulated: 0 },
	).stops;

	const donutBackground =
		gradientStops.length > 0 ? `conic-gradient(${gradientStops.join(', ')})` : 'conic-gradient(hsl(var(--muted)) 0 100%)';

	return (
		<div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-10">
			<div
				className="relative grid size-32 place-items-center rounded-full sm:size-40"
				style={{ backgroundImage: donutBackground }}
			>
				<div className="grid size-20 place-items-center rounded-full bg-white sm:size-24">
					<div className="text-center">
						<div className="text-3xl leading-none font-medium text-cyan-950 sm:text-4xl">
							{Math.round(topOption?.percentage ?? 0)}%
						</div>
						<div className="text-sm text-cyan-950">{topOption?.label ?? emptyLabel}</div>
					</div>
				</div>
			</div>
			<div className="w-full space-y-3 sm:w-auto sm:space-y-4">
				{options.map((option, index) => (
					<div key={option.id} className="grid grid-cols-3 items-center gap-3 text-sm text-cyan-950 sm:flex sm:gap-6">
						<div className="size-2 rounded-sm" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
						<div className="min-w-0 sm:min-w-24">{option.label}</div>
						<div className="w-auto text-right font-medium sm:w-10">{Math.round(option.percentage)}%</div>
					</div>
				))}
			</div>
		</div>
	);
};

import { type ReactNode } from 'react';
import { Progress } from '../../feedback/progress/progress';
import { InfoTooltip } from '../../overlays/info-tooltip/info-tooltip';

type StatProgressEnd = {
	label: string;
	value: string;
	info?: ReactNode;
};

type StatProgressProps = {
	title: string;
	start: StatProgressEnd;
	end: StatProgressEnd;
	percent: number;
};

const EndLabel = ({ label, info }: StatProgressEnd) => (
	<div className="flex items-center gap-1">
		<span>{label}</span>
		{info && (
			<InfoTooltip label={`Show ${label} calculation`} size="sm">
				{info}
			</InfoTooltip>
		)}
	</div>
);

export const StatProgress = ({ title, start, end, percent }: StatProgressProps) => {
	const safePercent = Number.isFinite(percent) ? Math.max(0, percent) : 0;

	return (
		<div className="space-y-4">
			<h2 className="text-lg font-bold">{title}</h2>

			<div className="text-muted-foreground flex justify-between text-xs">
				<EndLabel {...start} />
				<EndLabel {...end} />
			</div>

			<div className="flex justify-between text-xl font-bold">
				<span>{start.value}</span>
				<span>{end.value}</span>
			</div>

			<div className="space-y-1">
				<Progress value={Math.min(100, safePercent)} />
				<div className="text-muted-foreground flex justify-end text-xs">{`${safePercent.toFixed(1)}%`}</div>
			</div>
		</div>
	);
};

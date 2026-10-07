import { type ReactNode } from 'react';
import { InfoTooltip } from '../../overlays/info-tooltip/info-tooltip';

type StatHeadlineProps = {
	title: string;
	value: string;
	info?: { label: string; content: ReactNode };
};

export const StatHeadline = ({ title, value, info }: StatHeadlineProps) => (
	<div className="space-y-6">
		<h2 className="text-lg font-bold">{title}</h2>
		<div className="flex items-center gap-2 text-xl font-bold">
			<span>{value}</span>
			{info && <InfoTooltip label={info.label}>{info.content}</InfoTooltip>}
		</div>
	</div>
);

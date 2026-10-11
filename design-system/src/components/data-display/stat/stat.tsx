import { type ReactNode } from 'react';
import { InfoTooltip } from '../../overlays/info-tooltip/info-tooltip';

type StatProps = {
	label: string;
	value: ReactNode;
	info?: ReactNode;
};

export const Stat = ({ label, value, info }: StatProps) => (
	<div>
		<div className="text-muted-foreground flex items-center gap-1 text-xs">
			<p>{label}</p>
			{info && (
				<InfoTooltip label={`Show ${label} explanation`} size="xs">
					{info}
				</InfoTooltip>
			)}
		</div>
		<div className="font-medium">{value}</div>
	</div>
);

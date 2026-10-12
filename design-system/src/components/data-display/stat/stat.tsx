import { cva } from 'class-variance-authority';
import { type ReactNode } from 'react';
import { InfoTooltip } from '../../overlays/info-tooltip/info-tooltip';

type StatProps = {
	label: string;
	value: ReactNode;
	info?: ReactNode;
	size?: 'default' | 'lg';
};

const valueVariants = cva('', {
	variants: {
		size: {
			default: 'font-medium',
			lg: 'text-xl',
		},
	},
});

export const Stat = ({ label, value, info, size = 'default' }: StatProps) => (
	<div>
		<div className="text-muted-foreground flex items-center gap-1 text-xs">
			<p>{label}</p>
			{info && (
				<InfoTooltip label={`Show ${label} explanation`} size="xs">
					{info}
				</InfoTooltip>
			)}
		</div>
		<div className={valueVariants({ size })}>{value}</div>
	</div>
);

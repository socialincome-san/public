import { CircleHelp } from 'lucide-react';
import { type ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../tool-tip/tool-tip';

const iconSizes = {
	xs: 'size-3',
	sm: 'size-3.5',
	md: 'size-4',
};

type InfoTooltipProps = {
	label: string;
	children: ReactNode;
	size?: keyof typeof iconSizes;
};

export const InfoTooltip = ({ label, children, size = 'md' }: InfoTooltipProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<button type="button" aria-label={label} className="text-muted-foreground hover:text-foreground inline-flex shrink-0">
				<CircleHelp className={iconSizes[size]} aria-hidden />
			</button>
		</TooltipTrigger>
		<TooltipContent sideOffset={8}>{children}</TooltipContent>
	</Tooltip>
);

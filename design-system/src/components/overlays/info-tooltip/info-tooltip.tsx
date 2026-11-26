import { Info } from 'lucide-react';
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
			{/* The icon stays small, the touch area is 24px: the minimum target of WCAG 2.5.8 */}
			<button
				type="button"
				aria-label={label}
				className="text-muted-foreground hover:text-foreground relative inline-flex shrink-0 after:absolute after:top-1/2 after:left-1/2 after:size-6 after:-translate-1/2"
			>
				<Info className={iconSizes[size]} aria-hidden />
			</button>
		</TooltipTrigger>
		<TooltipContent sideOffset={8}>{children}</TooltipContent>
	</Tooltip>
);

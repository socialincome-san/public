import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { CircleHelp } from 'lucide-react';
import { ReactNode } from 'react';

type StatProps = { label: string; value: ReactNode; tooltipText?: string };

export const Stat = ({ label, value, tooltipText }: StatProps) => {
	return (
		<div>
			<div className="text-muted-foreground flex items-center gap-1 text-xs">
				<p>{label}</p>
				{tooltipText && (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								aria-label={`Show ${label} explanation`}
								className="text-muted-foreground hover:text-foreground inline-flex"
							>
								<CircleHelp className="h-3 w-3" />
							</button>
						</TooltipTrigger>
						<TooltipContent sideOffset={8} className="max-w-[280px] text-sm">
							{tooltipText}
						</TooltipContent>
					</Tooltip>
				)}
			</div>
			<p className="font-medium">{value}</p>
		</div>
	);
};

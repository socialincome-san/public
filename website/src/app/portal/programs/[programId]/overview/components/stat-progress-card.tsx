import { Progress } from '@/components/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { CircleHelp } from 'lucide-react';

type StatProgressCardProps = {
	title: string;
	leftLabel: string;
	rightLabel: string;
	leftTooltipText?: string;
	rightTooltipText?: string;
	leftValue: string;
	rightValue: string;
	percent: number;
};

export const StatProgressCard = ({
	title,
	leftLabel,
	rightLabel,
	leftTooltipText,
	rightTooltipText,
	leftValue,
	rightValue,
	percent,
}: StatProgressCardProps) => {
	return (
		<div className="space-y-4">
			<h2 className="text-lg font-semibold">{title}</h2>

			<div className="text-muted-foreground flex justify-between text-xs">
				<div className="flex items-center gap-1">
					<span>{leftLabel}</span>
					{leftTooltipText && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label={`Show ${leftLabel} calculation`}
									className="text-muted-foreground hover:text-foreground inline-flex"
								>
									<CircleHelp className="h-3.5 w-3.5" />
								</button>
							</TooltipTrigger>
							<TooltipContent sideOffset={8} className="max-w-[320px] text-sm">
								{leftTooltipText}
							</TooltipContent>
						</Tooltip>
					)}
				</div>
				<div className="flex items-center gap-1">
					<span>{rightLabel}</span>
					{rightTooltipText && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									type="button"
									aria-label={`Show ${rightLabel} calculation`}
									className="text-muted-foreground hover:text-foreground inline-flex"
								>
									<CircleHelp className="h-3.5 w-3.5" />
								</button>
							</TooltipTrigger>
							<TooltipContent sideOffset={8} className="max-w-[320px] text-sm">
								{rightTooltipText}
							</TooltipContent>
						</Tooltip>
					)}
				</div>
			</div>

			<div className="flex justify-between text-xl font-semibold">
				<span>{leftValue}</span>
				<span>{rightValue}</span>
			</div>

			<Progress value={percent} />
		</div>
	);
};

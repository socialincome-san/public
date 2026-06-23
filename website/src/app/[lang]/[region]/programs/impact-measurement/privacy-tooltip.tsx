'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { Info } from 'lucide-react';

type ImpactMeasurementPrivacyTooltipProps = {
	message: string;
};

export const ImpactMeasurementPrivacyTooltip = ({ message }: ImpactMeasurementPrivacyTooltipProps) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<button
				type="button"
				aria-label={message}
				className="text-muted-foreground hover:text-foreground inline-flex"
				onClick={(event) => event.preventDefault()}
			>
				<Info className="size-4" />
			</button>
		</TooltipTrigger>
		<TooltipContent sideOffset={6} className="max-w-xs">
			{message}
		</TooltipContent>
	</Tooltip>
);

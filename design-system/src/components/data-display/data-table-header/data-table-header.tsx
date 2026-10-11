'use client';

import { InfoIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../../overlays/tool-tip/tool-tip';

type DataTableHeaderProps = {
	title: ReactNode;
	count: number;
	infoTooltip?: string;
	toolbar?: ReactNode;
};

export const DataTableHeader = ({ title, count, infoTooltip, toolbar }: DataTableHeaderProps) => (
	<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
		<div className="flex items-center gap-2">
			<h2 className="text-3xl">
				{title} <span className="text-muted-foreground text-lg">({count})</span>
			</h2>
			{infoTooltip ? (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							type="button"
							className="text-muted-foreground hover:text-foreground inline-flex items-center rounded-full p-1"
							aria-label="Table information"
						>
							<InfoIcon className="size-4" />
						</button>
					</TooltipTrigger>
					<TooltipContent side="right" sideOffset={8}>
						{infoTooltip}
					</TooltipContent>
				</Tooltip>
			) : null}
		</div>
		{toolbar}
	</div>
);

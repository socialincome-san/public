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
	<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div className="flex items-center gap-2">
			{title ? (
				<h2 className="text-3xl">
					{title} <span className="text-muted-foreground text-lg">({count})</span>
				</h2>
			) : null}
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
					<TooltipContent size="lg" side="bottom" sideOffset={8}>
						{infoTooltip}
					</TooltipContent>
				</Tooltip>
			) : null}
		</div>
		{toolbar}
	</div>
);

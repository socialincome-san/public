'use client';

import { makePayoutForecastColumns } from '@/components/data-table/columns/payout-forecast';
import { payoutForecastTableConfig } from '@/components/data-table/configs/payout-forecast-table.config';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import type { PayoutForecastTableViewRow } from '@/lib/services/payout/payout.types';
import { InfoIcon } from 'lucide-react';

type Props = {
	rows: PayoutForecastTableViewRow[];
	titleInfoTooltip?: string;
};

export const ProgramPayoutForecastTable = ({ rows, titleInfoTooltip }: Props) => {
	const columns = makePayoutForecastColumns();

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<h3 className="text-foreground text-lg font-bold">{payoutForecastTableConfig.title}</h3>
				<span className="text-muted-foreground text-sm">({rows.length})</span>
				{titleInfoTooltip ? (
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
							{titleInfoTooltip}
						</TooltipContent>
					</Tooltip>
				) : null}
			</div>

			<BaseTable columns={columns} data={rows} showRowsPerPageSelector={false} compact />
		</div>
	);
};

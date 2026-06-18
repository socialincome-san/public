'use client';

import { makePayoutForecastColumns } from '@/components/data-table/columns/payout-forecast';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tool-tip';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { PayoutForecastTableViewRow } from '@/lib/services/payout/payout.types';
import { InfoIcon } from 'lucide-react';

type Props = {
	rows: PayoutForecastTableViewRow[];
	titleInfoTooltip?: string;
};

export const ProgramPayoutForecastTable = ({ rows, titleInfoTooltip }: Props) => {
	const { t, translator } = useRouteTranslator({ namespace: 'website-common' });
	const columns = makePayoutForecastColumns(undefined, undefined, translator, true);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-2">
				<h3 className="text-foreground text-lg font-bold">{t('program-detail-page.payout-forecast-title')}</h3>
				<span className="text-muted-foreground text-sm">({rows.length})</span>
				{titleInfoTooltip ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								type="button"
								className="text-muted-foreground hover:text-foreground inline-flex items-center rounded-full p-1"
								aria-label={t('program-detail-page.table-information')}
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

			<BaseTable
				columns={columns}
				data={rows}
				showRowsPerPageSelector={false}
				compact
				emptyMessage={t('program-detail-page.no-results')}
			/>
		</div>
	);
};

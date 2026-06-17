'use client';

import { makePublicRecipientColumns } from '@/components/data-table/columns/recipients';
import { recipientsTableConfig } from '@/components/data-table/configs/recipients-table.config';
import { BaseTable } from '@/components/data-table/elements/base-table';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';

type Props = {
	rows: RecipientTableViewRow[];
	totalCount?: number;
};

export const ProgramRecipientsTable = ({ rows, totalCount }: Props) => {
	const columns = makePublicRecipientColumns();
	const displayedCount = totalCount ?? rows.length;
	const countLabel = displayedCount !== rows.length ? `${rows.length} of ${displayedCount}` : String(rows.length);

	return (
		<div className="flex flex-col gap-4 [&_table]:w-max [&_table]:min-w-full">
			<div className="flex items-center gap-2">
				<h3 className="text-foreground text-lg font-bold">{recipientsTableConfig.title}</h3>
				<span className="text-muted-foreground text-sm">({countLabel})</span>
			</div>

			<BaseTable columns={columns} data={rows} showRowsPerPageSelector={false} compact />
		</div>
	);
};

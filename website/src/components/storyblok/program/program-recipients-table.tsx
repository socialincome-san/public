'use client';

import { makePublicRecipientColumns } from '@/components/data-table/columns/recipients';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';
import type { PublicRecipientTableViewRow } from '@/lib/services/recipient/recipient.types';

type Props = {
	rows: PublicRecipientTableViewRow[];
	totalCount?: number;
};

export const ProgramRecipientsTable = ({ rows, totalCount }: Props) => {
	const { t, translator } = useRouteTranslator({ namespace: 'website-common' });
	const columns = makePublicRecipientColumns(translator);
	const displayedCount = totalCount ?? rows.length;
	const countLabel =
		displayedCount !== rows.length
			? t('program-detail-page.recipient-count-of', { shown: rows.length, total: displayedCount })
			: String(rows.length);

	return (
		<div className="flex flex-col gap-4 [&_table]:w-max [&_table]:min-w-full">
			<div className="flex items-center gap-2">
				<h3 className="text-foreground text-lg font-bold">{t('navigation.recipients')}</h3>
				<span className="text-muted-foreground text-sm">({countLabel})</span>
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

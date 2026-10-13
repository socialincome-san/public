'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { focusesTableConfig } from '@/components/data-table/configs/focuses-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { FocusTableViewRow } from '@/modules/focuses/focus.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { FocusDialog } from './focus-dialog';

export default function FocusesTable({
	rows,
	error,
	query,
}: {
	rows: FocusTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const { recordId: focusId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('focusId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: FocusTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={focusesTableConfig}
				titleInfoTooltip="Shows all configured focuses."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add focus',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<FocusDialog
				open={open}
				onOpenChange={onOpenChange}
				focusId={focusId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}

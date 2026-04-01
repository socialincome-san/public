'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { focusesTableConfig } from '@/components/data-table/configs/focuses-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { FocusTableViewRow } from '@/lib/services/focus/focus.types';
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
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [focusId, setFocusId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setFocusId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: FocusTableViewRow) => {
		setFocusId(row.id);
		setErrorMessage(null);
		setOpen(true);
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
				onOpenChange={setOpen}
				focusId={focusId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}

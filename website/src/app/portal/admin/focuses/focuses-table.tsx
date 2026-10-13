'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { focusesTableConfig } from '@/components/data-table/configs/focuses-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
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
	const [focusId, setFocusId] = useSearchParamState('focusId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const open = isCreateFormOpen || Boolean(focusId);

	const openEmptyForm = () => {
		setFocusId(undefined);
		setErrorMessage(null);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: FocusTableViewRow) => {
		setFocusId(row.id);
		setErrorMessage(null);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setFocusId(undefined);
			setIsCreateFormOpen(false);
		}
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

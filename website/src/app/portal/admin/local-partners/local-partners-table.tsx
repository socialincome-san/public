'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { localPartnersTableConfig } from '@/components/data-table/configs/local-partners-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { LocalPartnerTableViewRow } from '@/modules/local-partners/local-partner.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { LocalPartnerDialog } from './local-partner-dialog';

export default function LocalPartnersTable({
	rows,
	error,
	query,
}: {
	rows: LocalPartnerTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [partnerId, setPartnerId] = useState<string | undefined>(undefined);
	const openEmptyForm = () => {
		setPartnerId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: LocalPartnerTableViewRow) => {
		setPartnerId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(`Error saving local partner: ${errorMessage}`);
		console.error('Local Partner Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={localPartnersTableConfig}
				titleInfoTooltip="Shows all local partners in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add new local partner',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<LocalPartnerDialog
				open={open}
				onOpenChange={setOpen}
				localPartnerId={partnerId}
				errorMessage={errorMessage}
				onError={onError}
			/>
		</>
	);
}

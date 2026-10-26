'use client';

import { auditLogTab } from '@/components/audit/audit-log-tab';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { RecordDialog } from '@/components/data-table/clients/record-dialog';
import { usersTableConfig } from '@/components/data-table/configs/users-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { UserTableViewRow } from '@/modules/users/user.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import UsersForm from './users-form';

export default function UsersTable({
	rows,
	error,
	query,
}: {
	rows: UserTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const { recordId: userId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('userId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: UserTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
	};

	const onError = (error: unknown) => {
		const errorMessage = retrieveErrorMessage(error);
		setErrorMessage(`Error updating user: ${errorMessage}`);
		console.error('User Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={usersTableConfig}
				titleInfoTooltip="Shows all user accounts in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add user',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<RecordDialog
				open={open}
				onOpenChange={onOpenChange}
				title={userId ? 'Edit user' : 'Add user'}
				tabs={userId ? [auditLogTab('user', userId)] : []}
			>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}

				<UsersForm
					userId={userId}
					onSuccess={() => onOpenChange(false)}
					onCancel={() => onOpenChange(false)}
					onError={onError}
				/>
			</RecordDialog>
		</>
	);
}

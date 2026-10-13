'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { usersTableConfig } from '@/components/data-table/configs/users-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
import type { TableQueryState } from '@/components/data-table/query-state';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import type { UserTableViewRow } from '@/modules/users/user.types';
import { Alert, AlertDescription, AlertTitle } from '@socialincome/design-system/feedback/alert/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@socialincome/design-system/overlays/dialog/dialog';
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
	const [userId, setUserId] = useSearchParamState('userId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const open = isCreateFormOpen || Boolean(userId);

	const openEmptyForm = () => {
		setUserId(undefined);
		setErrorMessage(null);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: UserTableViewRow) => {
		setUserId(row.id);
		setErrorMessage(null);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setUserId(undefined);
			setIsCreateFormOpen(false);
		}
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

			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{userId ? 'Edit' : 'Add'} user</DialogTitle>
					</DialogHeader>

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
				</DialogContent>
			</Dialog>
		</>
	);
}

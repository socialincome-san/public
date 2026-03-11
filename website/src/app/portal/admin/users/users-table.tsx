'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { usersTableConfig } from '@/components/data-table/configs/users-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { UserTableViewRow } from '@/lib/services/user/user.types';
import { logger } from '@/lib/utils/logger';
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
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [userId, setUserId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setUserId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: UserTableViewRow) => {
		setUserId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		const errorMessage =
			error instanceof Error
				? error.message
				: typeof error === 'string'
					? error
					: 'An unexpected error occurred while saving.';
		setErrorMessage(`Error saving user: ${errorMessage}`);
		logger.error('User Form Error', { error });
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

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{userId ? 'Edit' : 'Add'} user</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}

					<UsersForm userId={userId} onSuccess={() => setOpen(false)} onCancel={() => setOpen(false)} onError={onError} />
				</DialogContent>
			</Dialog>
		</>
	);
}

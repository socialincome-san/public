'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeUserColumns } from '@/components/data-table/columns/users';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { UserTableViewRow } from '@/lib/services/user/user.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import UsersForm from './users-form';

export default function UsersTable({ rows, error }: { rows: UserTableViewRow[]; error: string | null }) {
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

	const onError = (error?: unknown) => {
		setErrorMessage(`Error saving user: ${error}`);
		logger.error('User Form Error', { error });
	};

	return (
		<>
			<DataTable
				title="Users"
				error={error}
				emptyMessage="No users found"
				data={rows}
				makeColumns={makeUserColumns}
				actions={<Button onClick={openEmptyForm}>Add user</Button>}
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

					<UsersForm
						userId={userId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

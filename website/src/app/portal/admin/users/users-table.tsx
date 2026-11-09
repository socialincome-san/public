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
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
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
		setErrorMessage(t('status.errorUpdatingUser', { error: errorMessage }));
		console.error('User Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={{
					...usersTableConfig,
					title: t('table.users'),
					emptyMessage: t('table.noUsers'),
				}}
				titleInfoTooltip={t('table.usersTooltip')}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('actions.addUser'),
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<RecordDialog
				open={open}
				onOpenChange={onOpenChange}
				title={userId ? t('dialog.editUser') : t('dialog.addUser')}
				tabs={userId ? [auditLogTab('user', userId)] : []}
			>
				{errorMessage && (
					<Alert variant="destructive">
						<AlertTitle>{t('common.error')}</AlertTitle>
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

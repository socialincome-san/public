'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { organizationsTableConfig } from '@/components/data-table/configs/organizations-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { OrganizationTableViewRow } from '@/lib/services/organization/organization.types';
import { getErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import OrganizationsForm from './organizations-form';

export default function OrganizationsTable({
	rows,
	error,
	query,
}: {
	rows: OrganizationTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [organizationId, setOrganizationId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setOrganizationId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: OrganizationTableViewRow) => {
		setOrganizationId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const onError = (error: unknown) => {
		const message = getErrorMessage(error);
		setErrorMessage(`Error saving organization: ${message}`);
		logger.error('Organization Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={organizationsTableConfig}
				titleInfoTooltip="Shows all organizations visible in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add organization',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{organizationId ? 'Edit' : 'Add'} organization</DialogTitle>
					</DialogHeader>

					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}

					<OrganizationsForm
						organizationId={organizationId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

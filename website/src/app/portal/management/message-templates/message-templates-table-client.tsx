'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { messageTemplatesTableConfig } from '@/components/data-table/configs/message-templates-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import { MessageTemplateTableViewRow } from '@/lib/services/messaging/message-template.types';
import { retrieveErrorMessage } from '@/lib/utils/error-message';
import { logger } from '@/lib/utils/logger';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import MessageTemplatesForm from './message-templates-form';

export default function MessageTemplatesTableClient({
	rows,
	error,
	query,
}: {
	rows: MessageTemplateTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [templateId, setTemplateId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setTemplateId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: MessageTemplateTableViewRow) => {
		setTemplateId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
		if (!nextOpen) {
			setTemplateId(undefined);
		}
	};

	const onError = (error: unknown) => {
		const message = retrieveErrorMessage(error);
		setErrorMessage(`Error saving template: ${message}`);
		logger.error('Message Template Form Error', { error });
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={messageTemplatesTableConfig}
				rows={rows}
				error={error}
				query={query}
				onRowClick={openEditForm}
				actionMenuItems={[
					{
						label: 'Add new template',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
			/>

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{templateId ? 'Edit' : 'Add'} Message Template</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription className="max-w-full overflow-auto">{errorMessage}</AlertDescription>
						</Alert>
					)}
					<MessageTemplatesForm
						templateId={templateId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

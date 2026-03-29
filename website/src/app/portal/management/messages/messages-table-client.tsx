'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { messagesTableConfig } from '@/components/data-table/configs/messages-table.config';
import { TableQueryState } from '@/components/data-table/query-state';
import { MessageTableViewRow } from '@/lib/services/messaging/messaging-log.types';
import { SendIcon } from 'lucide-react';
import { useState } from 'react';
import SendMessageDialog from './send-message/send-message-dialog';

export default function MessagesTableClient({
	rows,
	error,
	query,
}: {
	rows: MessageTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [sendDialogOpen, setSendDialogOpen] = useState(false);

	return (
		<>
			<ConfiguredDataTableClient
				config={messagesTableConfig}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Send new message',
						icon: <SendIcon />,
						onSelect: () => setSendDialogOpen(true),
					},
				]}
			/>

			<SendMessageDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen} />
		</>
	);
}

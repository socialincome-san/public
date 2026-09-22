import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { sentEmailsTableConfig } from '@/components/data-table/configs/sent-emails-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { SentEmailTableViewRow } from '@/lib/services/sent-email/sent-email.types';

export default function SentMailsTable({
	rows,
	error,
	query,
}: {
	rows: SentEmailTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	return <ConfiguredDataTableClient config={sentEmailsTableConfig} rows={rows} error={error} query={query} />;
}

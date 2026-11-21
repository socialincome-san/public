'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { emailCatalogTableConfig } from '@/components/data-table/configs/email-catalog-table.config';
import type { EmailCatalogEntry } from '@/modules/mail/mail.types';
import { useRouter } from 'next/navigation';

export const EmailsTable = ({ rows, error }: { rows: EmailCatalogEntry[]; error: string | null }) => {
	const router = useRouter();

	return (
		<ConfiguredDataTableClient
			config={emailCatalogTableConfig}
			titleInfoTooltip="Every email Social Income sends or plans to send. Live emails go through the code and are logged; external ones are sent by SendGrid, Firebase or Stripe."
			rows={rows}
			error={error}
			onRowClick={(row) => router.push(`/portal/admin/emails/${row.key}`)}
		/>
	);
};

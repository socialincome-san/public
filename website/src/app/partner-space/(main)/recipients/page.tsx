import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';

export default function RecipientsPage() {
	return (
		<Suspense>
			<RecipientsDataLoader />
		</Suspense>
	);
}

const RecipientsDataLoader = async () => {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();

	const result = await services.recipient.getTableViewByLocalPartnerId(partner.id);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];

	return <RecipientsTableClient rows={rows} error={error} readOnly={false} actorKind="local-partner" />;
};

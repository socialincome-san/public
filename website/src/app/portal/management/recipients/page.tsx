import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
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
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.recipient.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== ProgramPermission.operator : true;

	return <RecipientsTableClient rows={rows} error={error} readOnly={readOnly} />;
};

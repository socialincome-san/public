import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';

export default async function RecipientsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const recipientService = new RecipientService();
	const result = await recipientService.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== 'edit' : true;

	return <RecipientsTableClient rows={rows} error={error} readOnly={readOnly} />;
}

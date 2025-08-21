import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';

export default async function RecipientsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const result = await service.getRecipientTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: RecipientTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Recipients"
			error={error}
			emptyMessage="No recipients found"
			data={rows}
			makeColumns={makeRecipientColumns}
			actions={<Button>Add new recipient</Button>}
		/>
	);
}

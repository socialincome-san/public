import TableWrapper from '@/app/portal/components/data-table/elements/table-wrapper';
import RecipientsTable from '@/app/portal/components/data-table/recipients/recipients-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';

export default async function AllRecipientsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const result = await service.getRecipientTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper
			title={`${rows.length} Recipients`}
			error={error}
			isEmpty={!rows.length}
			emptyMessage="No recipients found"
		>
			<RecipientsTable data={rows} showProgramName />
		</TableWrapper>
	);
}

import { Button } from '@/app/portal/components/button';
import { makeRecipientColumns } from '@/app/portal/components/data-table/columns/recipients';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import type { RecipientTableViewRow } from '@socialincome/shared/src/database/services/recipient/recipient.types';

type Props = { params: Promise<{ programId: string }> };

export default async function RecipientsPageProgramScoped({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const recipientService = new RecipientService();
	const recipientsResult = await recipientService.getTableViewProgramScoped(user.id, programId);

	const error = recipientsResult.success ? null : recipientsResult.error;
	const rows: RecipientTableViewRow[] = recipientsResult.success ? recipientsResult.data.tableRows : [];

	return (
		<DataTable
			title="Recipients"
			error={error}
			emptyMessage="No recipients found"
			data={rows}
			makeColumns={makeRecipientColumns}
			actions={<Button>Add new recipient</Button>}
			hideProgramName
		/>
	);
}

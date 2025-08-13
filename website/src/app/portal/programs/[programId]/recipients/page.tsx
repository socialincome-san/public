import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { recipientColumns } from '@/app/portal/components/custom/data-table/recipients-columns';
import { Button } from '@/app/portal/components/ui/button';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';

type Props = { params: Promise<{ programId: string }> };

export default async function RecipientsPage({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const res = await service.getRecipientTableRows(programId, user.id);

	if (!res.success) return <div className="p-4">Error loading recipients</div>;
	if (!res.data.length) return <div className="p-4">No recipients found</div>;

	return (
		<div>
			<Button variant="default">Add new recipient</Button>
			<DataTable columns={recipientColumns} data={res.data} />
		</div>
	);
}

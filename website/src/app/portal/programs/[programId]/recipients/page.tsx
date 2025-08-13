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
		<>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">{res.data.length} Recipients</h1>
				<Button variant="default">Add new recipient</Button>
			</div>
			<DataTable columns={recipientColumns} data={res.data} />
		</>
	);
}

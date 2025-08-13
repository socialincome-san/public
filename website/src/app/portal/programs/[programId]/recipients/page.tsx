import { DataTable } from '@/app/portal/components/custom/data-table/data-table';
import { recipientColumns } from '@/app/portal/components/custom/data-table/recipients-columns';
import { Button } from '@/app/portal/components/ui/button';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientTableMapper } from '@socialincome/shared/src/database/services/recipient/recipient.mapper';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';

type Props = { params: Promise<{ programId: string }> };

export default async function RecipientsPage({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const result = await service.getRecipientsForProgram(programId, user.id);

	if (!result.success) return <div className="p-4">Error loading recipients</div>;
	if (!result.data.length) return <div className="p-4">No recipients found</div>;

	const mapper = new RecipientTableMapper();
	const tableRows = mapper.mapList(result.data);

	return (
		<>
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">{tableRows.length} Recipients</h1>
				<Button variant="default">Add new recipient</Button>
			</div>
			<DataTable columns={recipientColumns} data={tableRows} />
		</>
	);
}

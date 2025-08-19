import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import RecipientsTable from '@/app/portal/components/custom/data-table/recipients/recipients-table';
import { Button } from '@/app/portal/components/ui/button';
import Link from 'next/link';

import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';

type Props = { params: Promise<{ programId: string }> };

export default async function RecipientsPage({ params }: Props) {
	const { programId } = await params;

	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const result = await service.getRecipientTableViewForProgramAndUser(programId, user.id);

	const error = result.success ? null : result.error;
	const tableRows = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.programPermission === 'viewer' : true;

	return (
		<TableWrapper error={error} isEmpty={!tableRows.length} emptyMessage="No recipients found">
			<div className="mb-4 flex items-center justify-between">
				<h1 className="text-xl font-semibold">{tableRows.length} Recipients</h1>

				<Button disabled={readOnly}>
					<Link href={`/portal/programs/${programId}/recipients/new`}>Add new recipient</Link>
				</Button>
			</div>

			<RecipientsTable data={tableRows} readOnly={readOnly} />
		</TableWrapper>
	);
}

import { Button } from '@/app/portal/components/button';
import TableWrapper from '@/app/portal/components/data-table/elements/table-wrapper';
import RecipientsTable from '@/app/portal/components/data-table/recipients/recipients-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@socialincome/shared/src/database/services/recipient/recipient.service';
import Link from 'next/link';

type Props = { params: Promise<{ programId: string }> };

export default async function RecipientsPage({ params }: Props) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const service = new RecipientService();
	const result = await service.getRecipientTableViewForProgramAndUser(programId, user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.programPermission === 'viewer' : true;

	return (
		<TableWrapper
			title={`${rows.length} Recipients`}
			error={error}
			isEmpty={!rows.length}
			emptyMessage="No recipients found"
			actions={
				<Button disabled={readOnly}>
					<Link href={`/portal/programs/${programId}/recipients/new`}>Add new recipient</Link>
				</Button>
			}
		>
			<RecipientsTable data={rows} />
		</TableWrapper>
	);
}

import { Card } from '@/components/card';
import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };

export default function RecipientsPageProgramScoped({ params }: Props) {
	return (
		<Card>
			<Suspense>
				<RecipientsProgramScopedDataLoader params={params} />
			</Suspense>
		</Card>
	);
}

async function RecipientsProgramScopedDataLoader({ params }: { params: Promise<{ programId: string }> }) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const recipientService = new RecipientService();
	const recipientsResult = await recipientService.getTableViewProgramScoped(user.id, programId);

	const error = recipientsResult.success ? null : recipientsResult.error;
	const rows: RecipientTableViewRow[] = recipientsResult.success ? recipientsResult.data.tableRows : [];
	const readOnly = recipientsResult.success ? recipientsResult.data.permission !== ProgramPermission.operator : true;

	return <RecipientsTableClient rows={rows} error={error} programId={programId} readOnly={readOnly} />;
}

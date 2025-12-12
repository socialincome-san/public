import { RecipientsTableClient } from '@/components/data-table/clients/recipients-table-client';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import type { RecipientTableViewRow } from '@/lib/services/recipient/recipient.types';
import { ProgramPermission, RecipientStatus } from '@prisma/client';
import { Suspense } from 'react';

type Props = { params: Promise<{ programId: string }> };

export default function CandidatesPageProgramScoped({ params }: Props) {
	return (
		<Suspense>
			<CandidatesProgramScopedDataLoader params={params} />
		</Suspense>
	);
}

async function CandidatesProgramScopedDataLoader({ params }: { params: Promise<{ programId: string }> }) {
	const { programId } = await params;
	const user = await getAuthenticatedUserOrRedirect();

	const recipientService = new RecipientService();
	const recipientsResult = await recipientService.getTableViewProgramAndStatusScoped(user.id, programId, [
		RecipientStatus.waitlisted,
	]);

	const error = recipientsResult.success ? null : recipientsResult.error;
	const rows: RecipientTableViewRow[] = recipientsResult.success ? recipientsResult.data.tableRows : [];
	const readOnly = recipientsResult.success ? recipientsResult.data.permission !== ProgramPermission.operator : true;

	return (
		<RecipientsTableClient rows={rows} error={error} programId={programId} readOnly={readOnly} title="Candidate Pool" />
	);
}

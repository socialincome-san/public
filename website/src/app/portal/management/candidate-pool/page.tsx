import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import type { CandidatesTableViewRow } from '@/lib/services/recipient/recipient.types';
import { Suspense } from 'react';
import { CandidatesTableClient } from './candidates-table-client';

export default function CandidatePoolPage() {
	return (
		<Suspense>
			<CandidatePoolDataLoader />
		</Suspense>
	);
}

async function CandidatePoolDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();

	const recipientService = new RecipientService();
	const result = await recipientService.getCandidatesTableView();

	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} />;
}

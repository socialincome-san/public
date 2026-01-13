import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { RecipientService } from '@/lib/services/recipient/recipient.service';
import type { CandidatesTableViewRow } from '@/lib/services/recipient/recipient.types';
import { Suspense } from 'react';
import { CandidatesTableClient } from './candidates-table-client';
import { CandidateService } from '@/lib/services/candidate/candidate.service';

export default function CandidatesPage() {
	return (
		<Suspense>
			<CandidatesDataLoader />
		</Suspense>
	);
}

async function CandidatesDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();

	const candidateService = new CandidateService();
	const result = await candidateService.getTableView(user.id);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} />;
}

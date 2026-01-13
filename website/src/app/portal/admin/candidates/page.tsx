import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { CandidateService } from '@/lib/services/candidate/candidate.service';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { Suspense } from 'react';
import { CandidatesTableClient } from './candidates-table-client';

export default function CandidatesPage() {
	return (
		<Suspense>
			<CandidatesDataLoader />
		</Suspense>
	);
}

async function CandidatesDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const candidateService = new CandidateService();
	const result = await candidateService.getTableView(user.id);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} />;
}

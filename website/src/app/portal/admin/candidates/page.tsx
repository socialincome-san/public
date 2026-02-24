import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import { CandidatesTableClient } from './candidates-table-client';

export default function CandidatesPage() {
	return (
		<Suspense>
			<CandidatesDataLoader />
		</Suspense>
	);
}

const CandidatesDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const result = await services.candidate.getTableView(user.id);
	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} />;
};

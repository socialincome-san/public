import { CandidatesTableClient } from '@/app/portal/admin/candidates/candidates-table-client';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import { CandidateService } from '@/lib/services/candidate/candidate.service';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { Suspense } from 'react';

export default function CandidatesPage() {
	return (
		<Suspense>
			<CandidatesDataLoader />
		</Suspense>
	);
}

const CandidatesDataLoader = async () => {
	const partner = await getAuthenticatedLocalPartnerOrRedirect();

	const candidateService = new CandidateService();
	const result = await candidateService.getTableViewByLocalPartner(partner.id);

	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} actorKind="local-partner" />;
}

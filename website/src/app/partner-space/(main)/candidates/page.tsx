import { CandidatesTableClient } from '@/app/portal/admin/candidates/candidates-table-client';
import { getAuthenticatedLocalPartnerOrRedirect } from '@/lib/firebase/current-local-partner';
import { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';
import { services } from '@/lib/services/services';
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

	const candidateService = services.candidate;
	const result = await candidateService.getTableViewByLocalPartner(partner.id);

	const error = result.success ? null : result.error;
	const rows: CandidatesTableViewRow[] = result.success ? result.data.tableRows : [];

	return <CandidatesTableClient rows={rows} error={error} readOnly={false} actorKind="local-partner" />;
};

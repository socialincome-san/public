import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributorService } from '@/lib/services/contributor/contributor.service';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import { Suspense } from 'react';
import ContributorsTable from './contributors-table';

export default function ContributorsPage() {
	return (
		<Suspense>
			<ContributorsDataLoader />
		</Suspense>
	);
}

async function ContributorsDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributorService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributorTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ContributorsTable rows={rows} error={error} />;
}

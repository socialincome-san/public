import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import type { ContributorTableViewRow } from '@/lib/services/contributor/contributor.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import ContributorsTableClient from './contributors-table-client';

export default function ContributorsPage() {
	return (
		<Suspense>
			<ContributorsDataLoader />
		</Suspense>
	);
}

const ContributorsDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const result = await services.contributor.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributorTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ContributorsTableClient rows={rows} error={error} />;
};

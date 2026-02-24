import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributionTableViewRow } from '@/lib/services/contribution/contribution.types';
import { services } from '@/lib/services/services';
import { Suspense } from 'react';
import { ContributionsTableClient } from './contributions-table-client';

export default function ContributionsPage() {
	return (
		<Suspense>
			<ContributionsDataLoader />
		</Suspense>
	);
}

const ContributionsDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();

	const service = services.contribution;
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributionTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== 'edit' : true;

	return <ContributionsTableClient rows={rows} error={error} readOnly={readOnly} />;
};

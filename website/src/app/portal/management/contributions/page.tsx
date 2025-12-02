import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributionService } from '@/lib/services/contribution/contribution.service';
import { ContributionTableViewRow } from '@/lib/services/contribution/contribution.types';
import { Suspense } from 'react';
import { ContributionsTableClient } from './contributions-table-client';

export default function ContributionsPage() {
	return (
		<Suspense>
			<ContributionsDataLoader />
		</Suspense>
	);
}

async function ContributionsDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributionService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributionTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== 'edit' : true;

	return <ContributionsTableClient rows={rows} error={error} readOnly={readOnly} />;
}

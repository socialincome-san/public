import { makeContributionsColumns } from '@/app/portal/components/data-table/columns/contributions';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import type { ContributionTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';

export default async function ContributionsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributionService();
	const result = await service.getContributionTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributionTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Contributions"
			error={error}
			emptyMessage="No contributions found"
			data={rows}
			makeColumns={makeContributionsColumns}
		/>
	);
}

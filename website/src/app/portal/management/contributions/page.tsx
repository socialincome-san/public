import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import ContributionsTable from '../../components/custom/data-table/contributions/contributions-table';

export default async function ContributionsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributionService();
	const result = await service.getContributionTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper title="Contributions" error={error} isEmpty={!rows.length} emptyMessage="No contributions found">
			<ContributionsTable data={rows} />
		</TableWrapper>
	);
}

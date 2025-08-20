import ContributorsTable from '@/app/portal/components/custom/data-table/contributors/contributors-table';
import TableWrapper from '@/app/portal/components/custom/data-table/elements/table-wrapper';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';

export default async function ContributorsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributorService();
	const result = await service.getContributorTableViewForUser(user.id);

	const error = result.success ? null : result.error;
	const rows = result.success ? result.data.tableRows : [];

	return (
		<TableWrapper title="Contributors" error={error} isEmpty={!rows.length} emptyMessage="No contributors found">
			<ContributorsTable data={rows} />
		</TableWrapper>
	);
}

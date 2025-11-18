import { Button } from '@/components/button';
import { makeYourContributionsColumns } from '@/components/data-table/columns/your-contributions';
import DataTable from '@/components/data-table/data-table';
import { getAuthenticatedContributorOrRedirect } from '@/lib/firebase/current-contributor';
import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import { YourContributionsTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import Link from 'next/link';

export async function ContributionsTable() {
	const contributor = await getAuthenticatedContributorOrRedirect();

	const service = new ContributionService();
	const result = await service.getYourContributionsTableView(contributor.id);

	const error = result.success ? null : result.error;
	const rows: YourContributionsTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Your Contributions"
			error={error}
			emptyMessage="No contributions found"
			data={rows}
			actions={
				<Link href="/donate/individual">
					<Button>Make a Contribution</Button>
				</Link>
			}
			makeColumns={makeYourContributionsColumns}
		/>
	);
}

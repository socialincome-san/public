import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributorService } from '@socialincome/shared/src/database/services/contributor/contributor.service';
import type { ContributorTableViewRow } from '@socialincome/shared/src/database/services/contributor/contributor.types';
import ContributorsTable from './contributors-table';

export default async function ContributorsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributorService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributorTableViewRow[] = result.success ? result.data.tableRows : [];

	return <ContributorsTable rows={rows} error={error} />;
}

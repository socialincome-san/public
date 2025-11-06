import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ContributionService } from '@socialincome/shared/src/database/services/contribution/contribution.service';
import type { ContributionTableViewRow } from '@socialincome/shared/src/database/services/contribution/contribution.types';
import ContributionsTable from './contributions-table';

export default async function ContributionsPage() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ContributionService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: ContributionTableViewRow[] = result.success ? result.data.tableRows : [];
	const readOnly = result.success ? result.data.permission !== 'edit' : true;

	return <ContributionsTable rows={rows} error={error} readOnly={readOnly} />;
}

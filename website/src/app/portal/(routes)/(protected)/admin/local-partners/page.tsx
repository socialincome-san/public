import { Button } from '@/app/portal/components/button';
import { makeLocalPartnerColumns } from '@/app/portal/components/data-table/columns/local-partners';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import type { LocalPartnerTableViewRow } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';

export default async function LocalPartnersPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new LocalPartnerService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: LocalPartnerTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Local Partners"
			error={error}
			emptyMessage="No local partners found"
			data={rows}
			makeColumns={makeLocalPartnerColumns}
			actions={<Button>Add new local partner</Button>}
		/>
	);
}

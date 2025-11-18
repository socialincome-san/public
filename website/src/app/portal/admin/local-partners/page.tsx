import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@socialincome/shared/src/database/services/local-partner/local-partner.service';
import type { LocalPartnerTableViewRow } from '@socialincome/shared/src/database/services/local-partner/local-partner.types';
import LocalPartnersTable from './local-partners-table';

export default async function LocalPartnersPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new LocalPartnerService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: LocalPartnerTableViewRow[] = result.success ? result.data.tableRows : [];

	return <LocalPartnersTable rows={rows} error={error} />;
}

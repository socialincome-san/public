import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { LocalPartnerService } from '@/lib/services/local-partner/local-partner.service';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';
import { Suspense } from 'react';
import LocalPartnersTable from './local-partners-table';

export default function LocalPartnersPage() {
	return (
		<Suspense>
			<LocalPartnersDataLoader />
		</Suspense>
	);
}

const LocalPartnersDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new LocalPartnerService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: LocalPartnerTableViewRow[] = result.success ? result.data.tableRows : [];

	return <LocalPartnersTable rows={rows} error={error} />;
}

import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { MobileMoneyProviderService } from '@/lib/services/mobile-money-provider/mobile-money-provider.service';
import type { MobileMoneyProviderTableViewRow } from '@/lib/services/mobile-money-provider/mobile-money-provider.types';
import { Suspense } from 'react';
import MobileMoneyProvidersTable from './mobile-money-providers-table';

export default function MobileMoneyProvidersPage() {
	return (
		<Suspense>
			<MobileMoneyProvidersDataLoader />
		</Suspense>
	);
}

const MobileMoneyProvidersDataLoader = async () => {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new MobileMoneyProviderService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: MobileMoneyProviderTableViewRow[] = result.success ? result.data.tableRows : [];

	return <MobileMoneyProvidersTable rows={rows} error={error} />;
};

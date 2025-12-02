import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { UserService } from '@/lib/services/user/user.service';
import type { UserTableViewRow } from '@/lib/services/user/user.types';
import { Suspense } from 'react';
import UsersTable from './users-table';

export default function UsersPage() {
	return (
		<Suspense>
			<UsersDataLoader />
		</Suspense>
	);
}

async function UsersDataLoader() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new UserService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: UserTableViewRow[] = result.success ? result.data.tableRows : [];

	return <UsersTable rows={rows} error={error} />;
}

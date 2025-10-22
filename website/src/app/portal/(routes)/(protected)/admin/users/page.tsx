import { Button } from '@/app/portal/components/button';
import { makeAllUsersColumns } from '@/app/portal/components/data-table/columns/all-users';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import type { AllUsersTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';

export default async function UsersPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new UserService();
	const result = await service.getAllUsersTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: AllUsersTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="All Users"
			error={error}
			emptyMessage="No users found"
			data={rows}
			makeColumns={makeAllUsersColumns}
			actions={<Button>Invite user</Button>}
		/>
	);
}

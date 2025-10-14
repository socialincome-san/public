import { Button } from '@/app/portal/components/button';
import { makeUserColumns } from '@/app/portal/components/data-table/columns/users';
import DataTable from '@/app/portal/components/data-table/data-table';
import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { UserService } from '@socialincome/shared/src/database/services/user/user.service';
import type { UserTableViewRow } from '@socialincome/shared/src/database/services/user/user.types';

export default async function UsersPage() {
	const user = await getAuthenticatedUserOrRedirect();
	await requireAdmin(user);

	const service = new UserService();
	const result = await service.getTableView(user.id);

	const error = result.success ? null : result.error;
	const rows: UserTableViewRow[] = result.success ? result.data.tableRows : [];

	return (
		<DataTable
			title="Users"
			error={error}
			emptyMessage="No users found"
			data={rows}
			makeColumns={makeUserColumns}
			actions={<Button>Invite user</Button>}
		/>
	);
}

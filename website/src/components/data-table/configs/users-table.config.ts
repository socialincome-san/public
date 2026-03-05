import { makeUserColumns } from '@/components/data-table/columns/users';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { UserTableViewRow } from '@/lib/services/user/user.types';

export const usersTableConfig: DataTableConfig<UserTableViewRow> = {
	id: 'admin-users',
	title: 'Users',
	emptyMessage: 'No users found',
	searchKeys: ['firstName', 'lastName', 'email', 'organizationName'],
	sortOptions: [
		{ id: 'user', label: 'User' },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'organizationName', label: 'Organization' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeUserColumns,
	showColumnVisibilitySelector: true,
};

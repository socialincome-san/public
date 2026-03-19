import { makeUserColumns } from '@/components/data-table/columns/users';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { UserTableViewRow } from '@/lib/services/user/user.types';

export const usersTableConfig: DataTableConfig<UserTableViewRow> = {
	id: 'admin-users',
	title: 'Users',
	emptyMessage: 'No users found',
	searchKeys: ['id', 'firstName', 'lastName', 'email', 'firebaseAuthUserId', 'organizationName', 'organizationNames'],
	sortOptions: [
		{ id: 'user', label: 'User' },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'organizationNames', label: 'Organizations' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeUserColumns,
	showColumnVisibilitySelector: true,
};

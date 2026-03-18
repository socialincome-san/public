import { makeOrganizationAdminColumns } from '@/components/data-table/columns/organizations';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { OrganizationTableViewRow } from '@/lib/services/organization/organization.types';

export const organizationsTableConfig: DataTableConfig<OrganizationTableViewRow> = {
	id: 'organizations-admin',
	title: 'All Organizations',
	emptyMessage: 'No organizations found',
	searchKeys: ['id', 'name'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'usersCount', label: 'Users' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeOrganizationAdminColumns,
	showColumnVisibilitySelector: true,
};

import { makeOrganizationMemberColumns } from '@/components/data-table/columns/organization-members';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { OrganizationMemberTableViewRow } from '@/lib/services/organization/organization.types';

export const organizationMembersTableConfig: DataTableConfig<OrganizationMemberTableViewRow> = {
	id: 'organization-members',
	title: 'Organization Members',
	emptyMessage: 'No members found',
	searchKeys: ['id', 'firstName', 'lastName', 'email'],
	sortOptions: [
		{ id: 'member', label: 'Member' },
		{ id: 'email', label: 'Email' },
		{ id: 'role', label: 'Role' },
		{ id: 'permission', label: 'Permission' },
	],
	makeColumns: makeOrganizationMemberColumns,
	showColumnVisibilitySelector: true,
};

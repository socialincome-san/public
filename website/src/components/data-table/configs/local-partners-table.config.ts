import { makeLocalPartnerColumns } from '@/components/data-table/columns/local-partners';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { LocalPartnerTableViewRow } from '@/lib/services/local-partner/local-partner.types';

export const localPartnersTableConfig: DataTableConfig<LocalPartnerTableViewRow> = {
	id: 'admin-local-partners',
	title: 'All Local Partners',
	emptyMessage: 'No local partners found',
	searchKeys: ['id', 'name', 'contactPerson', 'email', 'firebaseAuthUserId', 'contactNumber', 'causes'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'contactPerson', label: 'Contact person' },
		{ id: 'email', label: 'Email' },
		{ id: 'contactNumber', label: 'Contact number' },
		{ id: 'recipientsCount', label: 'Recipients' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeLocalPartnerColumns,
	showColumnVisibilitySelector: true,
};

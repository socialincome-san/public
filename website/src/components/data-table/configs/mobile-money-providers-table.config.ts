import { makeMobileMoneyProviderColumns } from '@/components/data-table/columns/mobile-money-providers';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { MobileMoneyProviderTableViewRow } from '@/modules/mobile-money-providers/mobile-money-provider.types';

export const mobileMoneyProvidersTableConfig: DataTableConfig<MobileMoneyProviderTableViewRow> = {
	id: 'admin-mobile-money-providers',
	title: 'Mobile Money Providers',
	emptyMessage: 'No mobile money providers found',
	searchKeys: ['id', 'name', 'parentName', 'payoutProcessLabel'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'parentName', label: 'Parent' },
		{ id: 'payoutProcess', label: 'Payout process' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: makeMobileMoneyProviderColumns,
	showColumnVisibilitySelector: true,
};

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

export const countryMobileMoneyProvidersTableConfig: DataTableConfig<MobileMoneyProviderTableViewRow> = {
	...mobileMoneyProvidersTableConfig,
	id: 'country-mobile-money-providers',
};

export const mobileMoneyProviderChildrenTableConfig: DataTableConfig<MobileMoneyProviderTableViewRow> = {
	...mobileMoneyProvidersTableConfig,
	id: 'mobile-money-provider-children',
	title: 'Child providers',
	searchKeys: mobileMoneyProvidersTableConfig.searchKeys.filter((key) => key !== 'parentName'),
	sortOptions: mobileMoneyProvidersTableConfig.sortOptions?.filter(({ id }) => id !== 'parentName'),
	makeColumns: () => makeMobileMoneyProviderColumns(true),
};

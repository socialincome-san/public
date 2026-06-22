import { makeYourContributionsColumns } from '@/components/data-table/columns/your-contributions';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { YourContributionsTableViewRow } from '@/lib/services/contribution/contribution.types';

export const getYourContributionsTableConfig = ({
	title,
	emptyMessage,
	enableSearch = false,
}: {
	title: string;
	emptyMessage: string;
	enableSearch?: boolean;
}): DataTableConfig<YourContributionsTableViewRow> => ({
	id: 'your-contributions',
	title,
	emptyMessage,
	searchKeys: enableSearch ? ['campaignTitle', 'currency'] : [],
	sortOptions: [
		{ id: 'updatedAt', label: 'Updated' },
		{ id: 'createdAt', label: 'Created' },
		{ id: 'status', label: 'Status' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'currency', label: 'Currency' },
		{ id: 'campaignTitle', label: 'Campaign' },
	],
	makeColumns: makeYourContributionsColumns,
	showColumnVisibilitySelector: true,
	showEntityIdColumn: false,
});

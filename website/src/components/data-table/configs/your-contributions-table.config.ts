import { makeYourContributionsColumns } from '@/components/data-table/columns/your-contributions';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { YourContributionsTableViewRow } from '@/modules/contributions/contribution.types';

export const getYourContributionsTableConfig = ({
	emptyMessage,
}: {
	emptyMessage: string;
}): DataTableConfig<YourContributionsTableViewRow> => ({
	id: 'your-contributions',
	emptyMessage,
	searchKeys: [],
	sortOptions: [
		{ id: 'updatedAt', label: 'Updated' },
		{ id: 'createdAt', label: 'Created' },
		{ id: 'status', label: 'Status' },
		{ id: 'amount', label: 'Amount' },
		{ id: 'paymentEventType', label: 'Payment type' },
		{ id: 'campaignTitle', label: 'Attribution' },
	],
	makeColumns: makeYourContributionsColumns,
	showColumnVisibilitySelector: true,
	showEntityIdColumn: false,
});

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTablePagination } from '../data-table-pagination/data-table-pagination';
import { DataTable } from './data-table';

const recipients = [
	{ id: 'r1', name: 'Aminata Kamara', country: 'Sierra Leone', payouts: '12 / 36' },
	{ id: 'r2', name: 'Ibrahim Sesay', country: 'Sierra Leone', payouts: '30 / 36' },
	{ id: 'r3', name: 'Kwame Mensah', country: 'Ghana', payouts: '4 / 36' },
];

const headerRows = [
	{
		id: 'header',
		cells: [
			{ id: 'name', content: 'Name' },
			{ id: 'country', content: 'Country' },
			{ id: 'payouts', content: 'Payouts' },
		],
	},
];

const rows = recipients.map((recipient) => ({
	id: recipient.id,
	onClick: () => undefined,
	cells: [
		{ id: 'name', content: recipient.name },
		{ id: 'country', content: recipient.country },
		{ id: 'payouts', content: recipient.payouts },
	],
}));

const meta = {
	title: 'Data Display/DataTable',
	component: DataTable,
	tags: ['autodocs'],
	args: {
		headerRows,
		rows,
		columnCount: 3,
		emptyMessage: 'No results.',
		stableHeight: false,
	},
} satisfies Meta<typeof DataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPagination: Story = {
	args: {
		pagination: (
			<DataTablePagination
				startRow={1}
				endRow={3}
				totalRows={3}
				canPreviousPage={false}
				canNextPage={false}
				onPreviousPage={() => undefined}
				onNextPage={() => undefined}
				pageSize={10}
				pageSizeOptions={[10, 25, 50]}
				onPageSizeChange={() => undefined}
			/>
		),
	},
};

export const Empty: Story = {
	args: {
		rows: [],
	},
};

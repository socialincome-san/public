import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTablePagination } from './data-table-pagination';

const meta = {
	title: 'Data Display/DataTablePagination',
	component: DataTablePagination,
	tags: ['autodocs'],
	args: {
		startRow: 11,
		endRow: 20,
		totalRows: 128,
		canPreviousPage: true,
		canNextPage: true,
		onPreviousPage: () => undefined,
		onNextPage: () => undefined,
		pageSize: 10,
		pageSizeOptions: [10, 25, 50, 100],
		onPageSizeChange: () => undefined,
	},
} satisfies Meta<typeof DataTablePagination>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutRowsPerPageSelector: Story = {
	args: {
		showRowsPerPageSelector: false,
	},
};

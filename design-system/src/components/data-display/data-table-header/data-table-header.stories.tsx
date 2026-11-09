import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTableToolbar } from '../data-table-toolbar/data-table-toolbar';
import { DataTableHeader } from './data-table-header';

const meta = {
	title: 'Data Display/DataTableHeader',
	component: DataTableHeader,
	tags: ['autodocs'],
	args: {
		title: 'Recipients',
		count: 128,
		infoTooltip: 'Recipients of all programs you have access to.',
		toolbar: (
			<DataTableToolbar
				labels={{
					search: 'Search',
					searchPlaceholder: 'Search...',
					searchFields: 'Fields:',
					clear: 'Clear',
					columns: 'Columns',
					visibleColumns: 'Visible columns',
					sort: 'Sort',
					sortBy: 'Sort by',
					field: 'Field',
					chooseField: 'Choose field',
					direction: 'Direction',
					chooseDirection: 'Choose direction',
					ascending: 'Ascending',
					descending: 'Descending',
					filters: 'Filters',
					filterResults: 'Filter results',
					noOptionsAvailable: 'No options available',
				}}
				showControls
				searchKeys={['firstName', 'lastName']}
				searchValue=""
				onSearchChange={() => undefined}
			/>
		),
	},
} satisfies Meta<typeof DataTableHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
	args: {
		infoTooltip: undefined,
		toolbar: undefined,
	},
};

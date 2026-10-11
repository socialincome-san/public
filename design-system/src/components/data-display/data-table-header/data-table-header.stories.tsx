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

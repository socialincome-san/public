import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DataTableEmptyState, DataTableErrorState, DataTableNoResults } from './data-table-states';

const meta = {
	title: 'Data Display/DataTableStates',
	component: DataTableEmptyState,
	tags: ['autodocs'],
	args: {
		message: 'No recipients yet.',
	},
} satisfies Meta<typeof DataTableEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const NoResults: Story = {
	args: {
		message: 'No recipients match your search.',
	},
	render: (args) => <DataTableNoResults {...args} />,
};

export const ErrorState: Story = {
	args: {
		message: 'The current search or filter is invalid. Please adjust your query and try again.',
	},
	render: (args) => <DataTableErrorState {...args} />,
};

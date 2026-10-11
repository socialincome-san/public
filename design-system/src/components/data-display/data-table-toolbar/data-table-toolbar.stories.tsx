import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PlusIcon } from 'lucide-react';
import { DataTableActionMenu } from '../data-table-action-menu/data-table-action-menu';
import { DataTableToolbar } from './data-table-toolbar';

const meta = {
	title: 'Data Display/DataTableToolbar',
	component: DataTableToolbar,
	tags: ['autodocs'],
	args: {
		showControls: true,
		searchKeys: ['firstName', 'lastName', 'phone'],
		searchValue: 'Kamara',
		onSearchChange: () => undefined,
		columns: [
			{ id: 'name', label: 'Name', visible: true, onToggle: () => undefined },
			{ id: 'country', label: 'Country', visible: true, onToggle: () => undefined },
			{ id: 'phone', label: 'Phone', visible: false, onToggle: () => undefined },
		],
		sortOptions: [
			{ id: 'lastName', label: 'Last name' },
			{ id: 'startDate', label: 'Start date' },
		],
		sortBy: 'startDate',
		sortDirection: 'desc',
		onSortChange: () => undefined,
		filters: [
			{
				id: 'status',
				label: 'Status',
				placeholder: 'All statuses',
				value: 'active',
				options: [
					{ value: 'active', label: 'Active' },
					{ value: 'completed', label: 'Completed' },
				],
				onChange: () => undefined,
			},
			{
				id: 'program',
				label: 'Program',
				placeholder: 'All programs',
				options: [],
				onChange: () => undefined,
			},
		],
		actions: <DataTableActionMenu items={[{ label: 'Add recipient', icon: <PlusIcon />, onSelect: () => undefined }]} />,
	},
} satisfies Meta<typeof DataTableToolbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchOnly: Story = {
	args: {
		searchValue: '',
		columns: [],
		sortOptions: [],
		filters: [],
		actions: undefined,
	},
};

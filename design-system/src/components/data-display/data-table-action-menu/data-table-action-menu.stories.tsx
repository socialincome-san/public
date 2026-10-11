import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { DataTableActionMenu } from './data-table-action-menu';

const meta = {
	title: 'Data Display/DataTableActionMenu',
	component: DataTableActionMenu,
	tags: ['autodocs'],
	args: {
		items: [
			{ label: 'Add recipient', icon: <PlusIcon />, onSelect: () => undefined },
			{ label: 'Export CSV', icon: <DownloadIcon />, onSelect: () => undefined },
		],
	},
} satisfies Meta<typeof DataTableActionMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Menu: Story = {};

export const SingleAction: Story = {
	args: {
		items: [{ label: 'Add recipient', icon: <PlusIcon />, onSelect: () => undefined }],
	},
};

import { type Meta, type StoryObj } from '@storybook/nextjs-vite';
import { DropdownMenuItem } from '../../overlays/dropdown-menu/dropdown-menu';
import { AddMenu } from './add-menu';

const meta = {
	title: 'Actions/Add Menu',
	component: AddMenu,
	tags: ['autodocs'],
	parameters: {
		docs: { description: { component: 'Upward-opening action menu with a plus icon that rotates into a close icon.' } },
	},
	args: {
		label: 'Add attachment',
		children: <DropdownMenuItem>Upload Reference Image</DropdownMenuItem>,
	},
} satisfies Meta<typeof AddMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };

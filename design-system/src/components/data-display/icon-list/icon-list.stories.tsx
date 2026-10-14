import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Building2, Handshake, LayoutDashboard } from 'lucide-react';
import { IconList } from './icon-list';

const meta = {
	title: 'Data Display/IconList',
	component: IconList,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
	args: {
		title: 'Where you’ll land',
		items: [
			{
				id: 'dashboard',
				icon: <LayoutDashboard />,
				title: 'Dashboard',
				description: 'For contributors: contributions and receipts',
			},
			{ id: 'partner-space', icon: <Handshake />, title: 'Partner Space', description: 'For local partners' },
			{ id: 'portal', icon: <Building2 />, title: 'Portal', description: 'For organizations running programs' },
		],
	},
	parameters: {
		docs: {
			description: {
				component:
					'A short list of items with an icon, a title and an optional description, e.g. to explain options at a glance.',
			},
		},
	},
} satisfies Meta<typeof IconList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTitle: Story = {
	args: { title: undefined },
};

export const WithoutDescriptions: Story = {
	args: {
		items: [
			{ id: 'dashboard', icon: <LayoutDashboard />, title: 'Dashboard' },
			{ id: 'partner-space', icon: <Handshake />, title: 'Partner Space' },
			{ id: 'portal', icon: <Building2 />, title: 'Portal' },
		],
	},
};

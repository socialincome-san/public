import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { TabNavigation } from './tab-navigation';

const meta = {
	title: 'Navigation/TabNavigation',
	component: TabNavigation,
	tags: ['autodocs'],
	args: {
		links: [
			{ href: '/portal/management/recipients', label: 'Recipients', active: true },
			{ href: '/portal/management/candidates', label: 'Candidates', active: false },
			{ href: '/portal/management/local-partners', label: 'Local partners', active: false },
			{ href: '/portal/management/contributors', label: 'Contributors', active: false },
		],
	},
} satisfies Meta<typeof TabNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

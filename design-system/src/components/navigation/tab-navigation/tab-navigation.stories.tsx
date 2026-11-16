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
	parameters: {
		docs: {
			description: {
				component:
					'Links between sibling pages, highlighting the current one. `segmented` looks like `Tabs` but navigates, e.g. between the audience pages of "Get involved"; it keeps the scroll position.',
			},
		},
	},
} satisfies Meta<typeof TabNavigation>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Segmented: Story = {
	args: {
		variant: 'segmented',
		label: 'Ways to get involved',
		links: [
			{ href: '/get-involved/individuals', label: 'Individuals', active: true },
			{ href: '/get-involved/companies', label: 'Companies', active: false },
			{ href: '/get-involved/ngos', label: 'NGOs', active: false },
		],
	},
};

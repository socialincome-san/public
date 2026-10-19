import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Breadcrumb } from './breadcrumb';

const meta = {
	title: 'Navigation/Breadcrumb',
	component: Breadcrumb,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TwoLevels: Story = {
	args: {
		links: [
			{ href: '/', label: 'Home' },
			{ href: '/dashboard', label: 'Dashboard' },
		],
	},
};

export const SeveralLevels: Story = {
	args: {
		links: [
			{ href: '/', label: 'Home' },
			{ href: '/programs', label: 'Programs' },
			{ href: '/programs/ghana', label: 'Ghana' },
			{ href: '/programs/ghana/recipients', label: 'Recipients' },
		],
	},
};

export const LongLabels: Story = {
	args: {
		links: [
			{ href: '/', label: 'Home' },
			{ href: '/recipients', label: 'Recipient Selection Process' },
			{ href: '/recipients/universal-basic-income', label: 'Universal Basic Income' },
		],
	},
};

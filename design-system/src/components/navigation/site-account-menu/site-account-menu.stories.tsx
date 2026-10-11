import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Building2, LayoutDashboard, Users } from 'lucide-react';
import { SiteAccountMenu } from './site-account-menu';

const meta = {
	title: 'Navigation/SiteAccountMenu',
	component: SiteAccountMenu,
	tags: ['autodocs'],
} satisfies Meta<typeof SiteAccountMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		firstName: 'Jane',
		lastName: 'Doe',
		links: [
			{ href: '/portal', label: 'Go to portal', icon: Users },
			{ href: '/dashboard/subscriptions', label: 'Go to dashboard', icon: LayoutDashboard },
			{ href: '/partner-space/recipients', label: 'Go to partner space', icon: Building2 },
		],
		signOutLabel: 'Sign out',
		onSignOut: () => undefined,
	},
};

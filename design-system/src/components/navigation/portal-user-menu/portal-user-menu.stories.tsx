import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayoutDashboard, Settings, User } from 'lucide-react';

import { PortalUserMenu } from './portal-user-menu';

const meta = {
	title: 'Navigation/PortalUserMenu',
	component: PortalUserMenu,
	tags: ['autodocs'],
	args: {
		variant: 'bar',
		name: 'Aminata Kamara',
		initials: 'AK',
		subtitle: 'Social Income',
		links: [
			{ href: '/portal/profile/account', label: 'Profile', icon: User },
			{ href: '/dashboard/subscriptions', label: 'Switch to dashboard', icon: LayoutDashboard },
			{ href: '/portal/admin/organizations', label: 'Admin', icon: Settings },
		],
		signOutLabel: 'Sign out',
		onSignOut: () => undefined,
	},
} satisfies Meta<typeof PortalUserMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Bar: Story = {};

export const Menu: Story = {
	args: { variant: 'menu', align: 'start' },
};

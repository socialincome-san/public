import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { LayoutDashboard, Settings, User } from 'lucide-react';

import { PortalNavbar } from './portal-navbar';

const meta = {
	title: 'Navigation/PortalNavbar',
	component: PortalNavbar,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		homeHref: '/portal',
		links: [
			{ href: '/portal/monitoring/payout-confirmation', label: 'Monitoring', active: true },
			{ href: '/portal/management/recipients', label: 'Management', active: false },
			{ href: '/portal/delivery/overview', label: 'Delivery', active: false },
			{ href: '/portal/messaging/templates', label: 'Messaging', active: false },
		],
		programMenu: {
			label: 'Programs',
			active: false,
			programs: [
				{ href: '/portal/programs/sierra-leone/overview', label: 'Sierra Leone' },
				{ href: '/portal/programs/liberia/overview', label: 'Liberia' },
			],
			emptyLabel: 'No programs',
			createProgramLabel: 'Create new program',
			renderCreateProgram: (trigger) => <div>{trigger}</div>,
		},
		userMenu: {
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
	},
} satisfies Meta<typeof PortalNavbar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ProgramOperator: Story = {
	args: {
		links: [],
		programMenu: { ...meta.args.programMenu, active: true },
	},
};

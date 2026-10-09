import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PortalNavbar } from '../../navigation/portal-navbar/portal-navbar';
import { PortalAppShell } from './portal-app-shell';

const meta = {
	title: 'Layout/PortalAppShell',
	component: PortalAppShell,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
	args: {
		navbar: (
			<PortalNavbar
				homeHref="/portal"
				links={[{ href: '/portal/monitoring/payout-confirmation', label: 'Monitoring', active: true }]}
				programMenu={{
					label: 'Programs',
					programs: [{ href: '/portal/programs/sierra-leone/overview', label: 'Sierra Leone' }],
					emptyLabel: 'No programs',
					createProgramLabel: 'Create new program',
					renderCreateProgram: (trigger) => <div>{trigger}</div>,
				}}
				userMenu={{
					name: 'Aminata Kamara',
					initials: 'AK',
					subtitle: 'Social Income',
					links: [],
					signOutLabel: 'Sign out',
					onSignOut: () => undefined,
				}}
			/>
		),
		children: <div className="w-site-width max-w-content mx-auto py-8">Page content</div>,
	},
} satisfies Meta<typeof PortalAppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

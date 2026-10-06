import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteMenuDesktop } from './site-menu-desktop';

const meta = {
	title: 'Navigation/SiteMenuDesktop',
	component: SiteMenuDesktop,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<div className="relative min-h-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SiteMenuDesktop>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		entries: [
			{
				type: 'dropdown',
				id: 'about',
				label: 'About us',
				groups: [
					{
						id: 'organisation',
						label: 'Organisation',
						links: [
							{ id: 'team', label: 'Team', href: '/en/int/about-us/team' },
							{ id: 'finances', label: 'Finances', href: '/en/int/about-us/finances' },
						],
						overview: { label: 'All about us', href: '/en/int/about-us' },
					},
					{
						id: 'programs',
						label: 'Programs',
						links: [{ id: 'sierra-leone', label: 'Sierra Leone', href: '/en/int/programs/sierra-leone' }],
					},
				],
			},
			{ type: 'link', id: 'journal', label: 'Journal', href: '/en/int/journal' },
			{ type: 'link', id: 'github', label: 'GitHub', href: 'https://github.com/socialincome-san/public', newTab: true },
		],
		dropdownAside: <div className="bg-card text-muted-foreground rounded-3xl p-6 text-sm">Donation form</div>,
	},
};

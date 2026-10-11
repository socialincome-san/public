import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { SiteMenuMobile } from './site-menu-mobile';

const meta = {
	title: 'Navigation/SiteMenuMobile',
	component: SiteMenuMobile,
	tags: ['autodocs'],
	parameters: {
		viewport: { defaultViewport: 'mobile1' },
	},
} satisfies Meta<typeof SiteMenuMobile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		homeHref: '/en/usd',
		labels: {
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			title: 'Menu',
			back: 'Back',
			homeLink: 'Social Income home',
		},
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
							{ id: 'team', label: 'Team', href: '/en/usd/about-us/team' },
							{ id: 'finances', label: 'Finances', href: '/en/usd/about-us/finances' },
						],
						overview: { label: 'All about us', href: '/en/usd/about-us' },
					},
				],
			},
			{ type: 'link', id: 'journal', label: 'Journal', href: '/en/usd/journal' },
			{ type: 'link', id: 'faq', label: 'FAQ', href: '/en/usd/faq' },
		],
		renderDonateAction: (closeMenu) => (
			<Button size="md" onClick={closeMenu}>
				Donate now
			</Button>
		),
		footerControls: (
			<Button variant="ghost" size="md">
				Log in
			</Button>
		),
	},
};

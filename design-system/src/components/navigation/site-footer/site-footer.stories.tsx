import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteFooter } from './site-footer';

const meta = {
	title: 'Navigation/SiteFooter',
	component: SiteFooter,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
	},
} satisfies Meta<typeof SiteFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		groups: [
			{
				id: 'about',
				label: 'About',
				links: [
					{ id: 'team', label: 'Team', href: '/en/int/about-us/team' },
					{ id: 'finances', label: 'Finances', href: '/en/int/about-us/finances' },
					{ id: 'faq', label: 'FAQ', href: '/en/int/faq' },
				],
			},
			{
				id: 'contact',
				label: 'Contact',
				links: [
					{ id: 'newsletter', label: 'Newsletter', href: '/en/int/newsletter', icon: 'newsletter' },
					{ id: 'contact', label: 'Contact', href: '/en/int/contact', icon: 'contact' },
				],
			},
			{
				id: 'social',
				label: 'Follow us',
				links: [
					{ id: 'instagram', label: 'Instagram', href: 'https://instagram.com', newTab: true, icon: 'instagram' },
					{ id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com', newTab: true, icon: 'linkedin' },
					{
						id: 'github',
						label: 'GitHub',
						href: 'https://github.com/socialincome-san/public',
						newTab: true,
						icon: 'github',
					},
				],
			},
			{
				id: 'apps',
				label: 'Apps',
				links: [
					{ id: 'appstore', label: 'App Store', href: 'https://apps.apple.com', newTab: true, icon: 'appstore' },
					{ id: 'googleplay', label: 'Google Play', href: 'https://play.google.com', newTab: true, icon: 'googleplay' },
				],
			},
		],
		copyright: '© 2026 Social Income. All rights reserved.',
	},
};

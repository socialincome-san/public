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
				id: 'who-we-support',
				label: 'Who we support',
				groups: [
					{
						id: 'programs',
						label: 'Programs',
						subtitle: '19 active programs',
						links: [
							{ id: 'mothers', label: 'Mothers and Newborns', href: '/en/usd/programs/mothers' },
							{ id: 'skills', label: 'Skills for Sustainability', href: '/en/usd/programs/skills' },
						],
						overview: { label: 'Show all 19', href: '/en/usd/programs' },
					},
					{
						id: 'focuses',
						label: 'Our focus areas',
						subtitle: '16 focus areas',
						links: [{ id: 'poverty', label: 'Poverty', href: '/en/usd/focuses/poverty' }],
						overview: { label: 'Show all 16', href: '/en/usd/focuses' },
					},
					{
						id: 'local-partners',
						label: 'Local Partners',
						subtitle: '16 partners',
						links: [{ id: 'aurora', label: 'Aurora Foundation', href: '/en/usd/local-partners/aurora' }],
						overview: { label: 'Show all 16', href: '/en/usd/local-partners' },
					},
				],
				footer: {
					label: '102 recipients in:',
					countries: [
						{ id: 'sl', country: 'SL', label: 'Sierra Leone (47)', href: '/en/usd/countries/sierra-leone' },
						{ id: 'lr', country: 'LR', label: 'Liberia (32)', href: '/en/usd/countries/liberia' },
					],
					overview: { label: 'All countries', href: '/en/usd/countries' },
				},
			},
			{
				type: 'dropdown',
				id: 'about',
				label: 'About us',
				groups: [
					{
						id: 'organisation',
						label: 'Social Income',
						subtitle: '65 volunteers',
						links: [
							{ id: 'donate', label: 'Donate', href: '/en/usd', onSelect: () => undefined },
							{ id: 'team', label: 'Our Team', href: '/en/usd/people' },
						],
					},
				],
				footer: {
					label: 'News from Social Income by email.',
					overview: { label: 'Subscribe to the newsletter', href: '/en/usd/newsletter' },
					overviewInline: true,
				},
			},
			{ type: 'link', id: 'journal', label: 'Journal', href: '/en/usd/journal' },
		],
	},
};

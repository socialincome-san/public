import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { SiteMenuDesktop } from './site-menu-desktop';

const meta = {
	title: 'Navigation/SiteMenuDesktop',
	component: SiteMenuDesktop,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Desktop main navigation. Dropdowns open on click and show up to three coloured columns, each with an optional badge, illustration and overview link, above an optional footer bar.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="relative min-h-136">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof SiteMenuDesktop>;

export default meta;

type Story = StoryObj<typeof meta>;

const illustrationSrc = '/assets/storybook/placeholder-portrait.svg';

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
						badge: '19 active programs',
						links: [
							{ id: 'mothers', label: 'Mothers and Newborns', href: '/en/usd/programs/mothers' },
							{ id: 'skills', label: 'Skills for Sustainability', href: '/en/usd/programs/skills' },
						],
						overview: { label: 'Show all 19', href: '/en/usd/programs' },
					},
					{
						id: 'focuses',
						label: 'Our focus areas',
						badge: '16 focus areas',
						links: [{ id: 'poverty', label: 'Poverty', href: '/en/usd/focuses/poverty' }],
						overview: { label: 'Show all 16', href: '/en/usd/focuses' },
					},
					{
						id: 'local-partners',
						label: 'Local Partners',
						badge: '16 partners',
						links: [{ id: 'aurora', label: 'Aurora Foundation', href: '/en/usd/local-partners/aurora' }],
						overview: { label: 'Show all 16', href: '/en/usd/local-partners' },
					},
				],
				footer: {
					label: '102 recipients in:',
					countries: [
						{ id: 'sl', country: 'SL', label: 'Sierra Leone (70)', href: '/en/usd/countries/sierra-leone' },
						{ id: 'lr', country: 'LR', label: 'Liberia (32)', href: '/en/usd/countries/liberia' },
					],
					overview: { label: 'All countries', href: '/en/usd/countries' },
				},
			},
			{
				type: 'dropdown',
				id: 'get-involved',
				label: 'Get involved',
				groups: [
					{
						id: 'individual',
						label: 'For individuals',
						badge: '7,148 donors',
						illustrationSrc,
						links: [
							{ id: 'donate', label: 'Donate', href: '/en/usd', onSelect: () => undefined },
							{ id: 'volunteer', label: 'Volunteer', href: '/en/usd/open-source' },
						],
					},
					{
						id: 'company',
						label: 'For companies',
						illustrationSrc,
						links: [{ id: 'talk', label: 'Invite us for a talk', href: '/en/usd/contact' }],
					},
					{
						id: 'ngo',
						label: 'For NGOs',
						illustrationSrc,
						links: [{ id: 'partner', label: 'Become a local partner', href: '/en/usd/local-partners' }],
					},
				],
				footer: { overview: { label: 'All ways to get involved', href: '/en/usd/get-involved' } },
			},
			{
				type: 'dropdown',
				id: 'about',
				label: 'About',
				groups: [
					{
						id: 'organisation',
						label: 'Social Income',
						badge: '65 volunteers',
						links: [{ id: 'team', label: 'Our Team', href: '/en/usd/people' }],
					},
				],
				footer: {
					label: 'News from Social Income by email.',
					overview: { label: 'Subscribe to the newsletter', href: '/en/usd/newsletter' },
				},
			},
			{ type: 'link', id: 'journal', label: 'Journal', href: '/en/usd/journal' },
		],
	},
};

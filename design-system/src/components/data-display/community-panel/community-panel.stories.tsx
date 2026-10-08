import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Backstage } from '../../overlays/backstage/backstage';
import { CommunityPanel } from './community-panel';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const people = (names: string[]) =>
	names.map((name, index) => ({ name, imageSrc: index % 2 === 0 ? portrait : undefined, href: '#' }));

const meta = {
	title: 'Data Display/CommunityPanel',
	component: CommunityPanel,
	tags: ['autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Content of the `Backstage` panel that shows the people behind a page and how to join them. Every section is optional and hidden when it has no items. Must be rendered as the `panel` of a `Backstage`, which reveals its sections one after another.',
			},
			story: { inline: false, iframeHeight: 720 },
		},
	},
	decorators: [
		(Story) => (
			<Backstage
				open
				onOpenChange={() => undefined}
				panelLabel="The people behind this page"
				closeLabel="Close"
				panel={<Story />}
			>
				<div className="bg-website-gradient min-h-screen" />
			</Backstage>
		),
	],
	args: {
		heading: 'Made by many.',
		headingEmphasis: 'Open to all.',
		intro: {
			link: { label: '33 volunteers', href: '#' },
			after: ' across 7 countries make Social Income possible. This page is maintained by:',
		},
	},
} satisfies Meta<typeof CommunityPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		contributors: {
			roles: [
				{ label: 'Content', people: people(['Aminata Kamara']) },
				{ label: 'Translation', people: people(['Sara Rossi', 'Léa Dubois']) },
			],
			showMoreLabel: 'Show all contributors',
			showLessLabel: 'Show fewer contributors',
			feedback: {
				text: 'Found a mistake?',
				action: { label: 'Reach out', href: 'mailto:hello@example.org', ariaLabel: 'Email us about this page' },
			},
		},
		groups: {
			title: 'Join on the ground or from anywhere',
			lessLabel: 'Show less',
			items: [
				{
					name: 'In the countries',
					tag: 'On site',
					text: 'Recipient onboarding, partner visits and payout monitoring in Freetown, Accra and Monrovia.',
					people: people(['Fatmata Sesay', 'Kofi Mensah', 'Ibrahim Koroma', 'Aminata Kamara', 'Sara Rossi']),
					moreLabel: '+2 people',
				},
				{
					name: 'In the code',
					tag: 'Remote',
					text: 'An open repository anyone can read, fork and fix.',
					people: people(['Nando Schär', 'Mia Keller']),
					moreLabel: '',
				},
			],
		},
		roles: {
			title: 'Which one are you?',
			text: 'Social Income runs on 20 roles. Here are 2 — ask the person doing it how to join in.',
			items: [
				{
					role: 'Fundraising',
					person: { name: 'Jonas Weber', imageSrc: portrait, href: '#' },
					action: { label: 'Reach out', href: 'mailto:jonas@example.org', ariaLabel: 'Email Jonas Weber about Fundraising' },
				},
				{
					role: 'Translation',
					person: { name: 'Léa Dubois' },
					action: { label: 'Reach out', href: 'mailto:lea@example.org', ariaLabel: 'Email Léa Dubois about Translation' },
				},
			],
		},
		options: {
			title: 'Still no idea? Here are some ways in.',
			items: [
				{ name: 'Join a field trip', effort: 'Applications twice a year' },
				{ name: 'Translate a page', effort: '~2 hours', href: '#' },
			],
			cta: { label: 'Join the community', href: '#' },
		},
		links: {
			title: 'Further reading',
			items: [
				{ title: 'Two weeks in Freetown', meta: 'Article by Sara Rossi', href: '#a', imageSrc: portrait },
				{ title: 'Open source, open books', meta: 'Article by Nando Schär', href: '#b' },
			],
		},
	},
};

export const HeadingOnly: Story = {
	args: {
		intro: undefined,
	},
};

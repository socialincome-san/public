import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { ContributorsCard } from './contributors-card';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const meta = {
	title: 'Data Display/ContributorsCard',
	component: ContributorsCard,
	tags: ['autodocs'],
	args: {
		showMoreLabel: 'Show all contributors',
		showLessLabel: 'Show fewer contributors',
		roles: [
			{ label: 'Content', people: [{ name: 'Aminata Kamara', imageSrc: portrait, href: '#' }] },
			{
				label: 'Translation',
				people: [
					{ name: 'Sara Rossi', href: '#' },
					{ name: 'Léa Dubois', imageSrc: portrait, href: '#' },
				],
			},
			{ label: 'Design', people: [{ name: 'Lukas Meier', imageSrc: portrait, href: '#' }] },
			{ label: 'Development', people: [{ name: 'Nando Schär', href: '#' }] },
		],
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
	parameters: {
		docs: {
			description: {
				component:
					'Who worked on a page, by role. Collapsed it names the first people in one row; expanded it lists every role and an optional `footer`.',
			},
		},
	},
} satisfies Meta<typeof ContributorsCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithFooter: Story = {
	args: {
		footer: (
			<div className="flex flex-wrap items-center justify-between gap-3">
				<span className="text-foreground text-base">Found a mistake?</span>
				<Button asChild variant="outline" size="sm">
					<a href="mailto:aminata.kamara@example.org">Reach out</a>
				</Button>
			</div>
		),
	},
};

export const SinglePerson: Story = {
	args: {
		roles: [{ label: 'Content', people: [{ name: 'Aminata Kamara', imageSrc: portrait }] }],
	},
};

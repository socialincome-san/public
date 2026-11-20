import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonNav } from './person-nav';

const meta = {
	title: 'Navigation/PersonNav',
	component: PersonNav,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Steps through a list of people on a dark surface: the previous person, a link to all of them, the next person. On phones only the arrows, labels and short names remain.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="bg-foreground rounded-3xl p-6">
				<Story />
			</div>
		),
	],
	args: {
		label: 'Volunteers',
		previous: {
			label: 'Previous',
			name: 'Aminata Kamara',
			shortName: 'Aminata',
			href: '#previous',
			imageSrc: '/assets/storybook/placeholder-portrait.svg',
		},
		next: { label: 'Next', name: 'Mohamed Sesay', shortName: 'Mohamed', href: '#next' },
		all: { label: 'See all', count: 58, href: '#all' },
	},
} satisfies Meta<typeof PersonNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongNames: Story = {
	args: {
		previous: {
			label: 'Previous',
			name: 'Maximiliana Alexandrina von Hohenzollern-Sigmaringen',
			shortName: 'Maximiliana',
			href: '#previous',
		},
		next: { label: 'Next', name: 'Kwame Gyabaa-Yeboah Agyemang', shortName: 'Kwame', href: '#next' },
	},
};

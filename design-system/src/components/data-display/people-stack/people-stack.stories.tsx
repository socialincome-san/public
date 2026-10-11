import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PeopleStack } from './people-stack';

const portrait = '/assets/storybook/placeholder-portrait.svg';

const firstNames = ['Aminata', 'Lukas', 'Sara', 'Kofi', 'Léa', 'Ibrahim', 'Mia', 'Jonas', 'Fatmata', 'Nando'];

const people = firstNames.map((firstName, index) => ({
	name: `${firstName} ${['Kamara', 'Meier', 'Rossi', 'Mensah', 'Dubois'][index % 5]}`,
	imageSrc: index % 3 === 0 ? portrait : undefined,
	href: '#',
}));

const meta = {
	title: 'Data Display/PeopleStack',
	component: PeopleStack,
	tags: ['autodocs'],
	args: {
		people,
		moreLabel: `+${people.length - 3} people`,
		lessLabel: 'Show less',
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
					'A few faces of a group and a toggle that lists everyone, each linking to their profile when an `href` is set.',
			},
		},
	},
} satisfies Meta<typeof PeopleStack>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FitsWithoutToggle: Story = {
	args: { people: people.slice(0, 3) },
};

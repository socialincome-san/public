import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonCard } from './person-card';

const meta = {
	title: 'Data Display/PersonCard',
	component: PersonCard,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A team member card with portrait, name, role and an optional volunteering duration that shows the start date on hover.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-72">
				<Story />
			</div>
		),
	],
	argTypes: {
		size: {
			control: 'select',
			options: ['default', 'small', 'compact'],
		},
	},
	args: {
		firstName: 'Aminata',
		lastName: 'Kamara',
		roleLabel: 'Program Lead',
		image: { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' },
		href: '#',
		duration: { label: '3 years', since: 'Since Mar 4, 2023' },
	},
} satisfies Meta<typeof PersonCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
	render: (args) => (
		<div className="flex items-start gap-6">
			<div className="w-72">
				<PersonCard {...args} size="default" />
			</div>
			<div className="w-60">
				<PersonCard {...args} size="small" />
			</div>
			<div className="w-48">
				<PersonCard {...args} size="compact" />
			</div>
		</div>
	),
	decorators: [(Story) => <Story />],
};

export const WithoutImage: Story = {
	args: {
		image: null,
		duration: null,
	},
};

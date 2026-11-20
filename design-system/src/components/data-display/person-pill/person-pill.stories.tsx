import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PersonPill } from './person-pill';

const meta = {
	title: 'Data Display/PersonPill',
	component: PersonPill,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A compact pill with a round portrait, a name and one line of detail, e.g. to show who leads a team or wrote an article. Links to a profile when it has an `href`.',
			},
		},
	},
	args: {
		firstName: 'Aminata',
		lastName: 'Kamara',
		subline: 'Operation',
		image: { src: '/assets/storybook/placeholder-portrait.svg', alt: 'Aminata Kamara' },
		href: '#',
	},
} satisfies Meta<typeof PersonPill>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutImage: Story = {
	args: {
		image: null,
	},
};

export const Country: Story = {
	args: {
		subline: 'Sierra Leone',
	},
};

export const VolunteerSince: Story = {
	args: {
		subline: 'Volunteer since Dec 2019',
	},
};

export const Circle: Story = {
	args: {
		subline: 'Technology Circle',
	},
};

export const CircleWithMore: Story = {
	args: {
		subline: 'Technology Circle',
		sublineSuffix: '+4',
		sublineLabel: 'Technology Circle and 4 more circles',
	},
};

export const TruncatedSubline: Story = {
	args: {
		subline: 'Technology and Infrastructure Circle',
		sublineSuffix: '+4',
		sublineLabel: 'Technology and Infrastructure Circle and 4 more circles',
	},
	decorators: [
		(Story) => (
			<div className="w-56">
				<Story />
			</div>
		),
	],
};

export const WithoutSubline: Story = {
	args: {
		subline: undefined,
	},
};

export const WithoutLink: Story = {
	args: {
		href: undefined,
	},
};

export const Row: Story = {
	render: (args) => (
		<div className="flex flex-wrap gap-3">
			<PersonPill {...args} />
			<PersonPill {...args} firstName="Mohamed" lastName="Sesay" subline="Management" image={null} />
			<PersonPill {...args} firstName="Lea" lastName="Strohm" subline="Technology" />
		</div>
	),
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CircleCard } from './circle-card';

const meta = {
	title: 'Data Display/Circle Card',
	component: CircleCard,
	tags: ['autodocs'],
	args: {
		title: 'Communication',
		href: '#communication',
		activeCount: 5,
		interestedCount: 2,
		activeLabel: '5 Members',
		interestedLabel: '2 Followers',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A linked card for a group such as a circle of volunteers. Members wander inside a ring, bump into each other and now and then gather around one member who "speaks"; followers sit on a slowly turning dotted orbit and are left out of the count line when there are none. The legend explains both on hover, focus or tap. Legend dots have the same size as the members in the visual. Below md the card is a compact row. With reduced motion everything stands still. `CircleCardList` lays the cards out (see Circle Card List) and `CircleCardLegend` explains the dots.',
			},
		},
	},
} satisfies Meta<typeof CircleCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const singleCard: Story['decorators'] = [
	(Story) => (
		<div className="max-w-sm">
			<Story />
		</div>
	),
];

export const Default: Story = { decorators: singleCard };

export const NoInterested: Story = {
	decorators: singleCard,
	args: { activeCount: 4, interestedCount: 0, activeLabel: '4 Members', interestedLabel: '0 Followers' },
};

export const OneActive: Story = {
	decorators: singleCard,
	args: { activeCount: 1, interestedCount: 3, activeLabel: '1 Member', interestedLabel: '3 Followers' },
};

export const NoMembers: Story = {
	decorators: singleCard,
	args: { activeCount: 0, interestedCount: 0, activeLabel: '0 Members', interestedLabel: '0 Followers' },
};

export const ManyMembers: Story = {
	decorators: singleCard,
	args: { activeCount: 24, interestedCount: 30, activeLabel: '24 Members', interestedLabel: '30 Followers' },
};

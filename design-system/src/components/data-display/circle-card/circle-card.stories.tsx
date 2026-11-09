import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CircleCard, CircleCardLegend, CircleCardList } from './circle-card';

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
					'A linked card for a group such as a circle of volunteers. Members wander inside a ring, bump into each other and now and then gather around one member who "speaks"; followers sit on a slowly turning dotted orbit and are left out of the count line when there are none. The legend explains both on hover, focus or tap. Legend dots have the same size as the members in the visual. Below md the card is a compact row. With reduced motion everything stands still. `CircleCardList` lays the cards out and `CircleCardLegend` explains the dots.',
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

const circles = [
	{ title: 'Communication', active: 5, interested: 2 },
	{ title: 'Technology', active: 8, interested: 4 },
	{ title: 'Partnerships', active: 3, interested: 0 },
	{ title: 'Fundraising', active: 6, interested: 1 },
	{ title: 'Research', active: 2, interested: 5 },
	{ title: 'Translation', active: 1, interested: 0 },
];

export const List: Story = {
	// The centered layout shrinks the story to its content, which would leave the grid one column wide
	parameters: { layout: 'padded' },
	decorators: [
		(Story) => (
			<div className="mx-auto max-w-6xl">
				<Story />
			</div>
		),
	],
	render: () => (
		<div className="flex flex-col gap-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<h2 className="text-primary text-4xl md:text-5xl">Circles</h2>
				<div className="ml-auto">
					<CircleCardLegend
						activeLabel="Circle Members"
						activeDescription="Members carry the circle's work and are responsible for getting it done."
						interestedLabel="Followers"
						interestedDescription="Followers are invited to the circle's meetings and are the first we ask when a task needs more hands."
					/>
				</div>
			</div>
			<CircleCardList
				items={circles}
				getKey={({ title }) => title}
				emptyMessage="No circles yet"
				renderItem={({ title, active, interested }) => (
					<CircleCard
						title={title}
						href={`#${title.toLowerCase()}`}
						activeCount={active}
						interestedCount={interested}
						activeLabel={`${active} ${active === 1 ? 'Member' : 'Members'}`}
						interestedLabel={`${interested} ${interested === 1 ? 'Follower' : 'Followers'}`}
					/>
				)}
			/>
		</div>
	),
};

export const EmptyList: Story = {
	render: () => <CircleCardList items={[]} getKey={String} renderItem={() => null} emptyMessage="No circles yet" />,
};

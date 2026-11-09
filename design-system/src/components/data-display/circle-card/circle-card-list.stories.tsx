import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CircleCard, CircleCardLegend } from './circle-card';
import { CircleCardList } from './circle-card-list';

const circles = [
	{ title: 'Communication', active: 5, interested: 2 },
	{ title: 'Technology', active: 8, interested: 4 },
	{ title: 'Partnerships', active: 3, interested: 0 },
	{ title: 'Fundraising', active: 6, interested: 1 },
	{ title: 'Research', active: 2, interested: 5 },
	{ title: 'Translation', active: 1, interested: 0 },
];

type Circle = (typeof circles)[number];

const meta = {
	title: 'Data Display/Circle Card List',
	component: CircleCardList<Circle>,
	tags: ['autodocs'],
	args: {
		items: circles,
		getKey: ({ title }) => title,
		emptyMessage: 'No circles yet',
		renderItem: ({ title, active, interested }) => (
			<CircleCard
				title={title}
				href={`#${title.toLowerCase()}`}
				activeCount={active}
				interestedCount={interested}
				activeLabel={`${active} ${active === 1 ? 'Member' : 'Members'}`}
				interestedLabel={`${interested} ${interested === 1 ? 'Follower' : 'Followers'}`}
			/>
		),
	},
	// The centered layout shrinks the story to its content, which would leave the grid one column wide
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Lays out `CircleCard`s: a list of rows on small screens, a grid of tiles from md up, and a message instead when there are no items. It renders each item through `renderItem` and has no client code, so server components can use it. Usually shown next to a `CircleCardLegend`.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="mx-auto max-w-6xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CircleCardList<Circle>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithLegend: Story = {
	decorators: [
		(Story) => (
			<div className="flex flex-col gap-8">
				<div className="ml-auto">
					<CircleCardLegend
						activeLabel="Circle Members"
						activeDescription="Members carry the circle's work and are responsible for getting it done."
						interestedLabel="Followers"
						interestedDescription="Followers are invited to the circle's meetings and are the first we ask when a task needs more hands."
					/>
				</div>
				<Story />
			</div>
		),
	],
};

export const Empty: Story = {
	args: { items: [] },
};

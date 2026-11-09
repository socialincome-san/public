import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TaskCardGrid } from './task-card-grid';

const items = [
	{ title: 'Raise funds for the programs', description: 'Find the money that keeps every basic income payment going.' },
	{ title: 'Win corporate partners', description: 'Bring companies on board that match their employees’ donations.' },
	{ title: 'Apply to foundations', description: 'Write grant applications and report back on the results.' },
	{ title: 'Look after partners', description: 'Keep in touch with existing partners and share what their support does.' },
	{ title: 'Prepare pitch material', description: 'Keep decks, facts and stories up to date for every conversation.' },
	{ title: 'Plan events', description: 'Organise talks and get-togethers with partners and donors.' },
	{ title: 'Track the pipeline', description: 'Keep an overview of who we talk to and what comes next.' },
	{ title: 'Onboard new volunteers', description: 'Help people who join the circle find their first task.' },
];

const meta = {
	title: 'Data Display/Task Card Grid',
	component: TaskCardGrid,
	tags: ['autodocs'],
	args: {
		items,
		showMoreLabel: 'Show all 8 tasks',
		showLessLabel: 'Show fewer tasks',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Numbered cards for a list of tasks or responsibilities. The first six show right away, the rest behind a show more button.',
			},
		},
	},
} satisfies Meta<typeof TaskCardGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Few: Story = {
	args: { items: items.slice(0, 4) },
};

export const WithoutDescriptions: Story = {
	args: { items: items.map(({ title }) => ({ title })) },
};

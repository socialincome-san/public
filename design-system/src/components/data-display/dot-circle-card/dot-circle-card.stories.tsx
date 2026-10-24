import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DotCircleCard } from './dot-circle-card';

const meta = {
	title: 'Data Display/Dot Circle Card',
	component: DotCircleCard,
	tags: ['autodocs'],
	args: {
		title: 'Technology Circle',
		description: '8 active · 4 interested',
		solidCount: 8,
		outlinedCount: 4,
		href: '#',
	},
	parameters: {
		docs: {
			description: {
				component:
					'A linked card for a group, e.g. a circle of volunteers, with one dot per member arranged inside a circle. Solid dots come first, outlined dots (e.g. interested people) after them.',
			},
		},
	},
} satisfies Meta<typeof DotCircleCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OneMember: Story = {
	args: { description: '1 active', solidCount: 1, outlinedCount: 0 },
};

export const ManyMembers: Story = {
	args: { description: '36 active · 12 interested', solidCount: 36, outlinedCount: 12 },
};

export const Empty: Story = {
	args: { description: 'No members yet', solidCount: 0, outlinedCount: 0 },
};

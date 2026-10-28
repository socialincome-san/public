import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TagList } from './tag-list';

const meta = {
	title: 'Data Display/Tag List',
	component: TagList,
	tags: ['autodocs'],
	args: {
		items: [{ label: 'Technology' }, { label: 'Partnerships' }, { label: 'Community' }],
	},
	parameters: {
		docs: {
			description: {
				component:
					'A wrapping list of tags, optionally with a count each, e.g. circles or contribution roles. Light tags stand apart from the default ones, and tags with a link show an arrow.',
			},
		},
	},
} satisfies Meta<typeof TagList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCounts: Story = {
	args: {
		items: [
			{ label: 'Content', count: 5 },
			{ label: 'Research', count: 4 },
			{ label: 'Translation', count: 3 },
			{ label: 'Development', count: 1 },
		],
	},
};

export const WithLightTags: Story = {
	args: {
		items: [{ label: 'Technology' }, { label: 'Partnerships' }, { label: 'Community', variant: 'light' }],
	},
};

export const WithLinks: Story = {
	args: {
		items: [
			{ label: 'Technology Circle', href: '#', variant: 'solid' },
			{ label: 'Community Circle', href: '#', variant: 'light' },
		],
	},
};

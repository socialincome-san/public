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
				component: 'A wrapping list of tags, optionally with a count each, e.g. circles or contribution roles.',
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

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CheckList } from './check-list';

const meta = {
	title: 'Data Display/CheckList',
	component: CheckList,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component: 'Short reassurances or benefits, each with a check icon.',
			},
		},
	},
} satisfies Meta<typeof CheckList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		items: ['2 people get an income, 8 more benefit', 'Cancel anytime', '100% goes directly to recipients'],
	},
};

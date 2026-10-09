import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { PendingContent } from './pending-content';

const meta = {
	title: 'Feedback/Pending Content',
	component: PendingContent,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Hides content that is rendered but not final yet, such as an amount whose currency is only known in the browser, while keeping its space in the layout.',
			},
		},
	},
	args: {
		pending: false,
		children: <p>CHF 1,250,000 paid out so far</p>,
	},
} satisfies Meta<typeof PendingContent>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const Pending: Story = {
	args: { pending: true },
};

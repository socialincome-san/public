import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CardAlertFooter } from './card-alert-footer';

const meta = {
	title: 'Feedback/CardAlertFooter',
	component: CardAlertFooter,
	tags: ['autodocs'],
	args: {
		text: '12 candidates ready',
		variant: 'confirm',
	},
	decorators: [
		(Story) => (
			<div className="bg-confirm-foreground w-80 rounded-2xl">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof CardAlertFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Confirm: Story = {};

export const Secondary: Story = {
	args: { variant: 'secondary', text: 'No candidates yet', trailingText: 'Sierra Leone' },
};

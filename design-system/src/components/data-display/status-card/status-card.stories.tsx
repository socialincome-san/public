import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusCard } from './status-card';

const meta = {
	title: 'Data Display/StatusCard',
	component: StatusCard,
	tags: ['autodocs'],
	args: {
		status: { text: '12 candidates ready to enroll', variant: 'confirm' },
		children: (
			<div className="flex flex-col gap-2">
				<h2 className="text-foreground text-xl font-bold">Education</h2>
				<p className="text-muted-foreground text-sm">162 recipients in 3 programs</p>
			</div>
		),
	},
	parameters: {
		docs: {
			description: {
				component: 'A card with a status line below it, such as whether candidates are ready to enroll.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StatusCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Confirm: Story = {};

export const Secondary: Story = {
	args: { status: { text: 'No candidates yet', variant: 'secondary' } },
};

export const Linked: Story = {
	args: { href: '#', inset: 'sm' },
};

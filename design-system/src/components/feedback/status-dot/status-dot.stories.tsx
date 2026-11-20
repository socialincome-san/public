import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatusDot } from './status-dot';

const meta = {
	title: 'Feedback/StatusDot',
	component: StatusDot,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A small dot before a status text. `live` pulses in the confirm color (it stays still with reduced motion), `inactive` is a ring in the text color. Always next to text that names the status.',
			},
		},
	},
	args: { variant: 'live' },
} satisfies Meta<typeof StatusDot>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Live: Story = {
	render: (args) => (
		<p className="flex items-center gap-2 text-sm font-medium">
			<StatusDot {...args} />
			Active volunteer
		</p>
	),
};

export const Inactive: Story = {
	args: { variant: 'inactive' },
	render: (args) => (
		<p className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
			<StatusDot {...args} />
			Former volunteer
		</p>
	),
};

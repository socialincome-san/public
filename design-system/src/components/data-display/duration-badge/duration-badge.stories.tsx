import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DurationBadge } from './duration-badge';

const meta = {
	title: 'Data Display/Duration Badge',
	component: DurationBadge,
	tags: ['autodocs'],
	args: {
		label: '3 years',
		since: 'Since Mar 4, 2023',
	},
	parameters: {
		docs: {
			description: {
				component: 'A frosted badge for media showing how long something has lasted, with the start date on hover.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="bg-muted-foreground rounded-3xl p-8">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof DurationBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Stat } from '../stat/stat';
import { StatGrid } from './stat-grid';

const meta = {
	title: 'Data Display/StatGrid',
	component: StatGrid,
	tags: ['autodocs'],
	args: {
		children: (
			<>
				<Stat label="Contributors" value="1’284" />
				<Stat label="Contributions" value="3’912" />
				<Stat label="Avg Contribution" value="CHF 42" />
				<Stat label="Via Stripe" value="CHF 98’400" />
			</>
		),
	},
	parameters: {
		docs: {
			description: {
				component: 'Two columns of secondary numbers. Inside a StatPanel it sits at the bottom.',
			},
		},
	},
} satisfies Meta<typeof StatGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

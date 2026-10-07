import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StatGrid } from '../stat-grid/stat-grid';
import { StatHeadline } from '../stat-headline/stat-headline';
import { StatProgress } from '../stat-progress/stat-progress';
import { Stat } from '../stat/stat';
import { StatPanel } from './stat-panel';

const meta = {
	title: 'Data Display/StatPanel',
	component: StatPanel,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A muted panel that groups a key figure with its details in a StatGrid. With `href` the whole panel links to the detail page.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-96">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StatPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithProgress: Story = {
	args: {
		href: '#',
		children: (
			<>
				<StatProgress
					title="Payout Progress"
					start={{ label: 'Paid out so far', value: 'SLE 1.2M' }}
					end={{ label: 'Total Program Cost', value: 'SLE 3.6M' }}
					percent={33.3}
				/>
				<StatGrid>
					<Stat label="Payout / Interval" value="SLE 700" />
					<Stat label="Interval" value="Monthly" />
					<Stat label="Payouts Done" value="1’764" />
					<Stat label="Remaining Payouts" value="3’528" />
				</StatGrid>
			</>
		),
	},
};

export const WithHeadline: Story = {
	args: {
		children: (
			<>
				<StatHeadline title="Recipient Status" value="162 recipients" />
				<StatGrid>
					<Stat label="Future" value="12" />
					<Stat label="Active" value="140" />
					<Stat label="Suspended" value="2" />
					<Stat label="Completed" value="8" />
				</StatGrid>
			</>
		),
	},
};

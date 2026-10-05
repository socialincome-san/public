import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { SubscriptionStatusBadge } from './subscription-status-badge';

const meta = {
	title: 'Components/SubscriptionStatusBadge',
	component: SubscriptionStatusBadge,
	tags: ['autodocs'],
	args: {
		status: 'active',
		label: 'Active',
	},
} satisfies Meta<typeof SubscriptionStatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-2">
			<SubscriptionStatusBadge status="active" label="Active" />
			<SubscriptionStatusBadge status="ended" label="Ended" />
		</div>
	),
};

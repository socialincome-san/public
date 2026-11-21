import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { Badge } from '../../data-display/badge/badge';
import { PlanOption } from './plan-option';

const meta = {
	title: 'Forms/PlanOption',
	component: PlanOption,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A selectable plan with an amount, an optional suffix and badge, and a short list of benefits. The radio on the right and a stronger border mark the selected plan. Stack several plans for a single choice.',
			},
		},
	},
	args: {
		amount: 'CHF 50',
		suffix: '/month',
		items: [{ id: 'reach', label: '1 direct, 6 indirect beneficiaries' }],
		selected: true,
		onSelect: () => undefined,
	},
} satisfies Meta<typeof PlanOption>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Idle: Story = {
	args: { selected: false },
};

export const WithBadgeAndEmphasis: Story = {
	args: {
		badge: (
			<Badge variant="verified" size="sm">
				Recommended
			</Badge>
		),
		items: [
			{ id: 'reach', label: '1 direct, 6 indirect beneficiaries' },
			{ id: 'community', label: 'Join a community of 3,788 supporters', icon: 'heart', emphasis: true },
		],
	},
};

const PlanChoiceExample = () => {
	const [selected, setSelected] = useState('1x');

	return (
		<div className="flex w-96 flex-col gap-3">
			<PlanOption
				amount="CHF 50"
				suffix="/month"
				items={[{ id: 'reach', label: '1 direct, 6 indirect beneficiaries' }]}
				selected={selected === '1x'}
				onSelect={() => setSelected('1x')}
			/>
			<PlanOption
				amount="CHF 100"
				suffix="/month"
				items={[
					{ id: 'double', label: 'Double your impact' },
					{ id: 'reach', label: '3 direct, 18 indirect beneficiaries' },
				]}
				selected={selected === '2x'}
				onSelect={() => setSelected('2x')}
			/>
		</div>
	);
};

export const Choice: Story = {
	render: () => <PlanChoiceExample />,
};

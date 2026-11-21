import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { PlanTile } from './plan-tile';

const meta = {
	title: 'Forms/PlanTile',
	component: PlanTile,
	tags: ['autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'A selectable plan: a label flag and a radio on top, a large amount and caption on a white card, with a tinted footer below it, e.g. for the impact of the plan. Selecting only highlights the white card. Place two side by side for a single choice.',
			},
		},
	},
	args: {
		label: '1% plan',
		amount: 'CHF 50',
		caption: 'per month',
		footer: '1 direct · 6 indirect',
		selected: true,
		onSelect: () => undefined,
	},
} satisfies Meta<typeof PlanTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Selected: Story = {};

export const Idle: Story = {
	args: { selected: false },
};

const PlanChoiceExample = () => {
	const [selected, setSelected] = useState('1x');

	return (
		<div className="grid w-96 grid-cols-2 gap-2.5">
			<PlanTile
				label="1% plan"
				amount="CHF 50"
				caption="per month"
				footer="1 direct · 6 indirect"
				selected={selected === '1x'}
				onSelect={() => setSelected('1x')}
			/>
			<PlanTile
				label="2% plan"
				amount="CHF 100"
				caption="per month"
				footer="3 direct · 18 indirect"
				selected={selected === '2x'}
				onSelect={() => setSelected('2x')}
			/>
		</div>
	);
};

export const Choice: Story = {
	render: () => <PlanChoiceExample />,
};

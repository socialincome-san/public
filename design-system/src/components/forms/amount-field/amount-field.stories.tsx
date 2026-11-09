import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { AmountField } from './amount-field';

const quickPicks = [40, 60, 100].map((value) => ({ value, ariaLabel: `CHF ${value}` }));

const meta = {
	title: 'Forms/Amount Field',
	component: AmountField,
	tags: ['autodocs'],
	args: {
		label: 'Custom amount (CHF)',
		value: '',
		onChange: () => undefined,
	},
	parameters: {
		docs: {
			description: {
				component:
					'A numeric amount input with a floating label. Optional quick picks appear inside the field while it has focus.',
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
} satisfies Meta<typeof AmountField>;

export default meta;

type Story = StoryObj<typeof meta>;

const InteractiveAmountField = () => {
	const [value, setValue] = useState('');
	const selected = Number(value);

	return (
		<AmountField
			label="Custom amount (CHF)"
			value={value}
			onChange={(e) => setValue(e.target.value)}
			quickPicks={quickPicks}
			selectedQuickPick={quickPicks.some((quickPick) => quickPick.value === selected) ? selected : null}
			onQuickPickSelect={(pick) => setValue(String(pick))}
		/>
	);
};

export const Default: Story = {
	render: () => <InteractiveAmountField />,
};

export const Filled: Story = {
	args: {
		value: '60',
	},
};

export const Inactive: Story = {
	args: {
		inactive: true,
	},
};

export const WithError: Story = {
	args: {
		value: '10.5',
		error: 'Whole amounts only',
	},
};

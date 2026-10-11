import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import { SelectableCard } from './selectable-card';

const meta = {
	title: 'Forms/SelectableCard',
	component: SelectableCard,
	tags: ['autodocs'],
} satisfies Meta<typeof SelectableCard>;

export default meta;

type Story = StoryObj<typeof meta>;

const SelectableCardExample = () => {
	const [selected, setSelected] = useState('card');

	return (
		<div className="flex w-80 flex-col gap-3">
			<SelectableCard selected={selected === 'card'} onSelect={() => setSelected('card')}>
				Card
			</SelectableCard>
			<SelectableCard selected={selected === 'bank'} onSelect={() => setSelected('bank')}>
				Bank transfer
			</SelectableCard>
		</div>
	);
};

export const Default: Story = {
	args: {
		selected: true,
		onSelect: () => undefined,
		children: 'Card',
	},
	render: () => <SelectableCardExample />,
};

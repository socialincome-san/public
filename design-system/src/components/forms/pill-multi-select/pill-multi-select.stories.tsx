import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { PillMultiSelect } from './pill-multi-select';

const items = [
	{ value: 'a', label: 'Education' },
	{ value: 'b', label: 'Healthcare' },
	{ value: 'c', label: 'Food security' },
	{ value: 'd', label: 'Economic empowerment' },
];

const meta = {
	title: 'Forms/PillMultiSelect',
	component: PillMultiSelect,
	tags: ['autodocs'],
	parameters: { docs: { description: { component: 'Generic accessible selection pills with optional disabled and empty states.' } } },
} satisfies Meta<typeof PillMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const Example = ({ initial = [], disabled = false, options = items }: {
	initial?: string[];
	disabled?: boolean;
	options?: typeof items;
}) => {
	const [selected, setSelected] = useState(initial);
	return (
		<PillMultiSelect
			label="Focuses"
			items={options}
			selectedValues={selected}
			onToggle={(value) => setSelected((current) => current.includes(value) ? current.filter((id) => id !== value) : [...current, value])}
			disabled={disabled}
			emptyLabel="No options available"
			removeLabel="Remove"
		/>
	);
};

export const Empty: Story = { args: { label: 'Focuses', items: [], selectedValues: [], onToggle: () => undefined, removeLabel: 'Remove' }, render: () => <Example options={[]} /> };
export const Selected: Story = { args: { label: 'Focuses', items, selectedValues: ['a'], onToggle: () => undefined, removeLabel: 'Remove' }, render: () => <Example initial={['a']} /> };
export const Disabled: Story = { args: { label: 'Focuses', items, selectedValues: ['a'], onToggle: () => undefined, removeLabel: 'Remove' }, render: () => <Example initial={['a']} disabled /> };
export const Wrapping: Story = { args: { label: 'Focuses', items, selectedValues: [], onToggle: () => undefined, removeLabel: 'Remove' }, render: () => <div className="w-48"><Example /></div> };

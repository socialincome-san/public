import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { PillMultiSelect, type PillMultiSelectItem } from './pill-multi-select';

const items: PillMultiSelectItem[] = [
	{ value: 'health', label: 'Health' },
	{ value: 'education', label: 'Education' },
	{ value: 'livelihoods', label: 'Livelihoods' },
];

const wrappingItems: PillMultiSelectItem[] = [
	{ value: 'health', label: 'Community health' },
	{ value: 'education', label: 'Primary education' },
	{ value: 'livelihoods', label: 'Small business livelihoods' },
	{ value: 'housing', label: 'Safe housing' },
	{ value: 'nutrition', label: 'Child nutrition' },
	{ value: 'water', label: 'Clean water access' },
];

const meta = {
	title: 'Forms/Pill Multi Select',
	component: PillMultiSelect,
	tags: ['autodocs'],
	args: {
		label: 'Focuses',
		items,
		selectedValues: [],
		onToggle: () => undefined,
	},
	parameters: {
		docs: {
			description: {
				component: 'A wrapping group of toggle pills for selecting any number of generic options.',
			},
		},
	},
} satisfies Meta<typeof PillMultiSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = {
	args: {
		items: [],
		emptyLabel: 'No options available',
	},
};

export const Selected: Story = {
	args: {
		selectedValues: ['health', 'education'],
	},
};

export const Disabled: Story = {
	args: {
		disabled: true,
		selectedValues: ['health'],
	},
};

export const Wrapping: Story = {
	args: {
		items: wrappingItems,
		selectedValues: ['education', 'nutrition'],
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};

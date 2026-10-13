import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ChangeList } from './change-list';

const meta = {
	title: 'Data Display/Change List',
	component: ChangeList,
	tags: ['autodocs'],
	args: {
		ariaLabel: 'Changes',
		items: [
			{ label: 'Payment phone', previous: '+232 31 000 003', next: '+41 79 000 01 01' },
			{ label: 'Last name', previous: 'Kamara', next: 'Koroma' },
		],
	},
	parameters: {
		docs: {
			description: {
				component:
					'Field changes shown like a diff: the old value struck through in red, the new value in green. Values that were added or removed show only one side.',
			},
		},
	},
} satisfies Meta<typeof ChangeList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Changed: Story = {};

export const AddedAndRemoved: Story = {
	args: {
		items: [
			{ label: 'Successor', previous: null, next: 'Grace Hopper' },
			{ label: 'Email', previous: 'ada@example.org', next: null },
		],
	},
};

export const LongValues: Story = {
	args: {
		items: [
			{
				label: 'Suspension reason',
				previous: 'Moved to another district and could not be reached for three months',
				next: 'Reached again through the local partner, payouts resume next month',
			},
		],
	},
};

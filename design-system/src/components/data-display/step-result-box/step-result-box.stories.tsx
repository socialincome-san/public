import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StepResultBox } from './step-result-box';

const meta = {
	title: 'Data Display/StepResultBox',
	component: StepResultBox,
	tags: ['autodocs'],
	args: {
		id: 1,
		filename: 'result.json',
		value: { payouts: 42, status: 'ok' },
		onClear: () => undefined,
	},
} satisfies Meta<typeof StepResultBox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const JsonValue: Story = {};

export const PlainText: Story = {
	args: { value: 'phone,amount\n+23276000000,700', filename: 'payouts.csv' },
};

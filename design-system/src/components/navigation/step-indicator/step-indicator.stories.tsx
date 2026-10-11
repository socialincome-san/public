import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { StepIndicator } from './step-indicator';

const steps = [{ label: 'Recipients' }, { label: 'Variables' }, { label: 'Assignments' }, { label: 'Summary' }];

const meta = {
	title: 'Navigation/StepIndicator',
	component: StepIndicator,
	tags: ['autodocs'],
	args: {
		steps,
		activeIndex: 1,
		ariaLabel: 'Progress',
	},
	parameters: {
		docs: {
			description: {
				component: 'Shows where the user is in a multi-step flow such as a wizard.',
			},
		},
	},
	argTypes: {
		variant: { control: 'select', options: ['dots', 'labelled', 'bars'] },
		activeIndex: { control: { type: 'number', min: 0, max: steps.length } },
	},
	decorators: [
		(Story) => (
			<div className="w-[40rem]">
				<Story />
			</div>
		),
	],
} satisfies Meta<typeof StepIndicator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Dots: Story = {};

export const Labelled: Story = {
	args: { variant: 'labelled', activeIndex: 2, onStepSelect: () => undefined },
};

export const Bars: Story = {
	args: { variant: 'bars' },
};

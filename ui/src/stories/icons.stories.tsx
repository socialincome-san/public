import type { Meta, StoryObj } from '@storybook/react';
import { DonateIcon } from '../icons/donate';
import { SIIcon } from '../icons/si';
import { SpinnerIcon } from '../icons/spinner';

const meta = {
	title: 'Components/Icons',
	tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj;

export const AllIcons: Story = {
	render: () => (
		<div className="flex flex-wrap gap-8">
			<div className="flex flex-col items-center gap-2">
				<DonateIcon className="h-8 w-8" />
				<span className="text-sm">DonateIcon</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SIIcon className="h-8 w-8" />
				<span className="text-sm">SIIcon</span>
			</div>
			<div className="flex flex-col items-center gap-2">
				<SpinnerIcon className="h-8 w-8" />
				<span className="text-sm">SpinnerIcon</span>
			</div>
		</div>
	),
};

export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<DonateIcon className="h-4 w-4" />
			<DonateIcon className="h-6 w-6" />
			<DonateIcon className="h-8 w-8" />
			<DonateIcon className="h-12 w-12" />
		</div>
	),
};

export const Colors: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<SIIcon className="text-accent h-8 w-8" />
			<SIIcon className="text-primary h-8 w-8" />
			<SIIcon className="text-secondary h-8 w-8" />
			<SIIcon className="text-destructive h-8 w-8" />
		</div>
	),
};

export const AnimatedSpinner: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<SpinnerIcon className="h-4 w-4" />
			<SpinnerIcon className="h-6 w-6" />
			<SpinnerIcon className="h-8 w-8" />
			<SpinnerIcon className="h-12 w-12" />
		</div>
	),
};

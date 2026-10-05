import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../button/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tool-tip';

const meta = {
	title: 'Components/Tooltip',
	component: Tooltip,
	tags: ['autodocs'],
} satisfies Meta<typeof Tooltip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => (
		<Tooltip {...args}>
			<TooltipTrigger asChild>
				<Button variant="outline">Hover me</Button>
			</TooltipTrigger>
			<TooltipContent>Donate now</TooltipContent>
		</Tooltip>
	),
};

export const LongContent: Story = {
	render: (args) => (
		<Tooltip {...args}>
			<TooltipTrigger asChild>
				<Button variant="outline">More information</Button>
			</TooltipTrigger>
			<TooltipContent className="max-w-60">
				Social Income sends direct cash transfers to people living in poverty, funded by a small share of your income.
			</TooltipContent>
		</Tooltip>
	),
};

export const Placement: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4 p-16">
			{(['top', 'bottom', 'left', 'right'] as const).map((side) => (
				<Tooltip key={side}>
					<TooltipTrigger asChild>
						<Button variant="outline">{side}</Button>
					</TooltipTrigger>
					<TooltipContent side={side}>Tooltip on {side}</TooltipContent>
				</Tooltip>
			))}
		</div>
	),
};

import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '../../actions/button/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './tool-tip';

const meta = {
	title: 'Overlays/Tooltip',
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
			<TooltipContent>
				Social Income sends direct cash transfers to people living in poverty, funded by a small share of your income.
			</TooltipContent>
		</Tooltip>
	),
};

export const OnDarkSurface: Story = {
	render: (args) => (
		<div className="bg-foreground text-primary-foreground rounded-3xl p-10 scheme-dark">
			<Tooltip {...args}>
				<TooltipTrigger asChild>
					<button type="button" className="cursor-help text-sm underline decoration-dotted underline-offset-4">
						years volunteering
					</button>
				</TooltipTrigger>
				<TooltipContent variant="light" sideOffset={8}>
					Volunteering since Mar 1, 2019
				</TooltipContent>
			</Tooltip>
		</div>
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

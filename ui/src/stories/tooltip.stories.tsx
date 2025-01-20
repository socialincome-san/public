import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '../components/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/tooltip';

const meta = {
	title: 'Components/Tooltip',
	component: Tooltip,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<TooltipProvider>
				<Story />
			</TooltipProvider>
		),
	],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof Tooltip>;

// Basic Tooltip
export const Basic: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Hover me</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>Add to library</p>
			</TooltipContent>
		</Tooltip>
	),
};

// With Icon
export const WithIcon: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<button className="flex h-8 w-8 items-center justify-center rounded-full border">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4" />
						<path d="M12 8h.01" />
					</svg>
				</button>
			</TooltipTrigger>
			<TooltipContent>
				<p>More information</p>
			</TooltipContent>
		</Tooltip>
	),
};

// Different Positions
export const DifferentPositions: Story = {
	render: () => (
		<div className="flex items-center justify-center space-x-4">
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Top</Button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>Tooltip on top</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Right</Button>
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>Tooltip on right</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Bottom</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p>Tooltip on bottom</p>
				</TooltipContent>
			</Tooltip>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button variant="outline">Left</Button>
				</TooltipTrigger>
				<TooltipContent side="left">
					<p>Tooltip on left</p>
				</TooltipContent>
			</Tooltip>
		</div>
	),
};

// With Rich Content
export const WithRichContent: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Profile</Button>
			</TooltipTrigger>
			<TooltipContent className="w-[200px]">
				<div className="space-y-2">
					<h4 className="font-medium">John Doe</h4>
					<p className="text-muted-foreground text-xs">Software Engineer at Example Corp</p>
					<div className="text-muted-foreground flex items-center text-xs">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="mr-1"
						>
							<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
							<circle cx="12" cy="10" r="3" />
						</svg>
						San Francisco, CA
					</div>
				</div>
			</TooltipContent>
		</Tooltip>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="outline">Custom Style</Button>
			</TooltipTrigger>
			<TooltipContent className="border-blue-600 bg-blue-500 text-white">
				<p>Custom styled tooltip</p>
			</TooltipContent>
		</Tooltip>
	),
};

// With Delay
export const WithDelay: Story = {
	render: () => (
		<Tooltip delayDuration={700}>
			<TooltipTrigger asChild>
				<Button variant="outline">Delayed Tooltip</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>This tooltip has a 700ms delay</p>
			</TooltipContent>
		</Tooltip>
	),
};

// Interactive Example
export const InteractiveExample: Story = {
	render: () => {
		const [isOpen, setIsOpen] = React.useState(false);

		return (
			<Tooltip open={isOpen} onOpenChange={setIsOpen}>
				<TooltipTrigger asChild>
					<Button variant="outline" onClick={() => setIsOpen(!isOpen)}>
						Click to {isOpen ? 'Hide' : 'Show'}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>This tooltip can be controlled programmatically</p>
				</TooltipContent>
			</Tooltip>
		);
	},
};

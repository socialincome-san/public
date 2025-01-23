import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Progress } from '../components/progress';

const meta = {
	title: 'Components/Progress',
	component: Progress,
	tags: ['autodocs'],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof Progress>;

// Basic Progress
export const Basic: Story = {
	render: () => (
		<div className="h-4 w-[300px]">
			<Progress value={50} />
		</div>
	),
};

// Different Values
export const DifferentValues: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="h-4 w-[300px]">
				<Progress value={0} />
			</div>
			<div className="h-4 w-[300px]">
				<Progress value={25} />
			</div>
			<div className="h-4 w-[300px]">
				<Progress value={50} />
			</div>
			<div className="h-4 w-[300px]">
				<Progress value={75} />
			</div>
			<div className="h-4 w-[300px]">
				<Progress value={100} />
			</div>
		</div>
	),
};

// Animated Progress
export const Animated: Story = {
	render: () => {
		const [progress, setProgress] = React.useState(0);

		React.useEffect(() => {
			const timer = setInterval(() => {
				setProgress((prevProgress) => (prevProgress >= 100 ? 0 : prevProgress + 10));
			}, 1000);

			return () => {
				clearInterval(timer);
			};
		}, []);

		return (
			<div className="h-4 w-[300px]">
				<Progress value={progress} />
			</div>
		);
	},
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="h-4 w-[300px]">
				<Progress
					value={60}
					className="bg-blue-100"
					style={
						{
							'--accent': 'hsl(var(--blue-500))',
						} as React.CSSProperties
					}
				/>
			</div>
			<div className="h-4 w-[300px]">
				<Progress
					value={80}
					className="bg-green-100"
					style={
						{
							'--accent': 'hsl(var(--green-500))',
						} as React.CSSProperties
					}
				/>
			</div>
		</div>
	),
};

// With Label
export const WithLabel: Story = {
	render: () => {
		const value = 75;
		return (
			<div className="space-y-2">
				<div className="flex justify-between text-sm">
					<span>Progress</span>
					<span>{value}%</span>
				</div>
				<div className="h-4 w-[300px]">
					<Progress value={value} />
				</div>
			</div>
		);
	},
};

// Different Sizes
export const DifferentSizes: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="h-2 w-[300px]">
				<Progress value={60} />
			</div>
			<div className="h-4 w-[300px]">
				<Progress value={60} />
			</div>
			<div className="h-6 w-[300px]">
				<Progress value={60} />
			</div>
		</div>
	),
};

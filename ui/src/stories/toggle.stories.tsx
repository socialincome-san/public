import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '../components/toggle';

const meta = {
	title: 'Components/Toggle',
	component: Toggle,
	tags: ['autodocs'],
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof Toggle>;

// Basic Toggle
export const Basic: Story = {
	render: () => (
		<Toggle aria-label="Toggle italic">
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
				<line x1="19" y1="4" x2="10" y2="4" />
				<line x1="14" y1="20" x2="5" y2="20" />
				<line x1="15" y1="4" x2="9" y2="20" />
			</svg>
		</Toggle>
	),
};

// With Text
export const WithText: Story = {
	render: () => (
		<Toggle aria-label="Toggle bold">
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
				className="mr-2"
			>
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
			Bold
		</Toggle>
	),
};

// Different Sizes
export const DifferentSizes: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Toggle size="sm" aria-label="Toggle small">
				Small
			</Toggle>
			<Toggle size="default" aria-label="Toggle default">
				Default
			</Toggle>
			<Toggle size="lg" aria-label="Toggle large">
				Large
			</Toggle>
		</div>
	),
};

// Variants
export const Variants: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Toggle variant="default" aria-label="Toggle default">
				Default
			</Toggle>
			<Toggle variant="outline" aria-label="Toggle outline">
				Outline
			</Toggle>
		</div>
	),
};

// Disabled State
export const DisabledState: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Toggle disabled aria-label="Toggle disabled">
				Disabled
			</Toggle>
			<Toggle disabled pressed aria-label="Toggle disabled pressed">
				Disabled Pressed
			</Toggle>
		</div>
	),
};

// With Icons Group
export const WithIconsGroup: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Toggle aria-label="Toggle bold">
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
					<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
					<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				</svg>
			</Toggle>
			<Toggle aria-label="Toggle italic">
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
					<line x1="19" y1="4" x2="10" y2="4" />
					<line x1="14" y1="20" x2="5" y2="20" />
					<line x1="15" y1="4" x2="9" y2="20" />
				</svg>
			</Toggle>
			<Toggle aria-label="Toggle underline">
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
					<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
					<line x1="4" y1="21" x2="20" y2="21" />
				</svg>
			</Toggle>
		</div>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<div className="flex items-center space-x-2">
			<Toggle
				className="bg-blue-100 hover:bg-blue-200 data-[state=on]:bg-blue-500 data-[state=on]:text-white"
				aria-label="Toggle custom"
			>
				Custom
			</Toggle>
			<Toggle
				className="bg-green-100 hover:bg-green-200 data-[state=on]:bg-green-500 data-[state=on]:text-white"
				aria-label="Toggle custom"
			>
				Custom
			</Toggle>
		</div>
	),
};

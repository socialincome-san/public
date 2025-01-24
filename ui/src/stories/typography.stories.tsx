import type { Meta, StoryObj } from '@storybook/react';
import { Typography } from '../components/typography';
import type { FontColor } from '../interfaces/color';

// Sample colors for the demo since we can't use the enum directly
const FONT_COLORS: FontColor[] = [
	'background',
	'foreground',
	'primary',
	'primary-foreground',
	'secondary',
	'secondary-foreground',
	'accent',
	'accent-foreground',
	'destructive',
	'destructive-foreground',
	'muted',
	'muted-foreground',
	'card',
	'card-foreground',
	'popover',
	'popover-foreground',
];

const meta = {
	title: 'Typography/Texts and Headers',
	component: Typography,
	tags: ['autodocs'],
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof Typography>;

// Font Sizes
export const Sizes: Story = {
	render: () => (
		<div className="space-y-4">
			<Typography size="6xl">6XL Typography</Typography>
			<Typography size="5xl">5XL Typography</Typography>
			<Typography size="4xl">4XL Typography</Typography>
			<Typography size="3xl">3XL Typography</Typography>
			<Typography size="2xl">2XL Typography</Typography>
			<Typography size="xl">XL Typography</Typography>
			<Typography size="lg">Large Typography</Typography>
			<Typography size="md">Medium Typography</Typography>
			<Typography size="sm">Small Typography</Typography>
			<Typography size="xs">XS Typography</Typography>
		</div>
	),
};

// Font Weights
export const Weights: Story = {
	render: () => (
		<div className="space-y-4">
			<Typography weight="bold">Bold Text</Typography>
			<Typography weight="medium">Medium Text</Typography>
			<Typography weight="normal">Normal Text</Typography>
		</div>
	),
};

// Line Heights
export const LineHeights: Story = {
	render: () => (
		<div className="space-y-8">
			<Typography lineHeight="none" className="bg-muted/20">
				Line Height None - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</Typography>
			<Typography lineHeight="tight" className="bg-muted/20">
				Line Height Tight - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</Typography>
			<Typography lineHeight="snug" className="bg-muted/20">
				Line Height Snug - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</Typography>
			<Typography lineHeight="normal" className="bg-muted/20">
				Line Height Normal - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
				ut labore et dolore magna aliqua.
			</Typography>
			<Typography lineHeight="relaxed" className="bg-muted/20">
				Line Height Relaxed - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
				ut labore et dolore magna aliqua.
			</Typography>
			<Typography lineHeight="loose" className="bg-muted/20">
				Line Height Loose - Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut
				labore et dolore magna aliqua.
			</Typography>
		</div>
	),
};

// Colors
export const Colors: Story = {
	render: () => (
		<div className="space-y-2">
			{FONT_COLORS.map((color) => (
				<Typography key={color} color={color}>
					{color} Text Color
				</Typography>
			))}
		</div>
	),
};

// Different HTML Elements
export const Elements: Story = {
	render: () => (
		<div className="space-y-4">
			<Typography as="h1" size="4xl" weight="bold">
				Heading 1
			</Typography>
			<Typography as="h2" size="3xl" weight="bold">
				Heading 2
			</Typography>
			<Typography as="h3" size="2xl" weight="bold">
				Heading 3
			</Typography>
			<Typography as="p">Regular paragraph text</Typography>
			<Typography as="span" size="sm">
				Small span text
			</Typography>
		</div>
	),
};

// Combined Properties
export const Combined: Story = {
	render: () => (
		<div className="space-y-4">
			<Typography size="4xl" weight="bold" color="primary" lineHeight="tight">
				Primary Heading
			</Typography>
			<Typography size="xl" weight="medium" color="secondary" lineHeight="normal">
				Secondary Subheading
			</Typography>
			<Typography size="md" color="muted-foreground" lineHeight="relaxed">
				Muted body text with relaxed line height. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
				eiusmod tempor incididunt ut labore et dolore magna aliqua.
			</Typography>
		</div>
	),
};

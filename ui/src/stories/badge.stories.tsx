import { ArrowRightIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import type { Meta, StoryObj } from '@storybook/react';
import { Badge, BadgeProps } from '../components/badge';

const meta = {
	title: 'Components/Badge',
	component: Badge,
	tags: ['autodocs'],
	argTypes: {
		variant: {
			description: 'Style variant of the badge',
			options: [
				'default',
				'secondary',
				'destructive',
				'muted',
				'accent',
				'outline',
				'interactive',
				'interactive-accent',
				'interactive-secondary',
				'interactive-destructive',
				'interactive-muted',
				'interactive-outline',
			],
			control: { type: 'select' },
		},
		size: {
			description: 'Size of the badge',
			options: ['sm', 'md', 'lg'],
			control: { type: 'select' },
		},
	},
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof Badge>;

/**
 * The Badge component is used to highlight and display short pieces of information.
 * It supports various variants and sizes to accommodate different use cases.
 *
 * Variants:
 * - Basic variants:
 *   - default: Primary colored badge for general use
 *   - secondary: Secondary colored badge for less emphasis
 *   - destructive: For error or warning states
 *   - muted: For less prominent information
 *   - accent: For highlighted information
 *   - outline: Border-only style for subtle emphasis
 *
 * - Interactive variants (with hover effects):
 *   - interactive: Primary colored with opacity hover effect
 *   - interactive-accent: Accent colored for important interactive elements
 *   - interactive-secondary: Secondary colored for less prominent actions
 *   - interactive-destructive: For removable or dangerous actions
 *   - interactive-muted: For subtle interactive elements
 *   - interactive-outline: Outlined style that fills on hover
 *
 * Features:
 * - Three size options (sm, md, lg)
 * - Customizable through className prop
 * - Support for icons and custom content
 * - Accessible by default
 *
 * @see {@link https://www.figma.com/file/...} Figma Design
 */
export const Default: Story = {
	args: {
		children: 'Badge',
	},
};

/**
 * Interactive badges feature opacity and color effects on hover.
 * This is the primary interactive variant, using the primary color scheme.
 * For other interactive styles, see interactive-accent, interactive-secondary,
 * interactive-destructive, interactive-muted, and interactive-outline variants.
 */
export const Interactive: Story = {
	args: {
		variant: 'interactive',
		children: 'Interactive Badge',
	},
};

/**
 * Interactive accent badge with opacity effects.
 * Useful for highlighting important interactive elements.
 */
export const InteractiveAccent: Story = {
	args: {
		variant: 'interactive-accent',
		children: 'Interactive Accent',
	},
};

/**
 * Badges come in three sizes: small (default), medium, and large.
 */
export const Sizes: Story = {
	render: () => (
		<div className="flex flex-wrap items-center gap-4">
			<Badge size="sm">Small Badge</Badge>
			<Badge size="md">Medium Badge</Badge>
			<Badge size="lg">Large Badge</Badge>
		</div>
	),
};

/**
 * All available badge variants.
 */
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Badge variant="default">Default</Badge>
			<Badge variant="secondary">Secondary</Badge>
			<Badge variant="destructive">Destructive</Badge>
			<Badge variant="muted">Muted</Badge>
			<Badge variant="accent">Accent</Badge>
			<Badge variant="outline">Outline</Badge>
			<Badge variant="interactive">Interactive</Badge>
			<Badge variant="interactive-accent">Interactive Accent</Badge>
			<Badge variant="interactive-secondary">Interactive Secondary</Badge>
			<Badge variant="interactive-destructive">Interactive Destructive</Badge>
			<Badge variant="interactive-muted">Interactive Muted</Badge>
			<Badge variant="interactive-outline">Interactive Outline</Badge>
		</div>
	),
};

/**
 * Examples of common use cases for badges in the application:
 * - Status indicators
 * - Category labels
 * - Counters
 * - Interactive filters
 */
export const CommonUseCases: Story = {
	render: () => (
		<div className="flex flex-col gap-4">
			{/* Status indicators */}
			<div className="flex gap-2">
				<Badge variant="interactive" size="md">
					Active
				</Badge>
				<Badge variant="interactive-muted" size="md">
					Pending
				</Badge>
				<Badge variant="interactive-destructive" size="md">
					Blocked
				</Badge>
				<Badge variant="muted" size="md">
					Archived
				</Badge>
			</div>
			{/* Content labels */}
			<div className="flex gap-2">
				<Badge variant="interactive-accent">Featured</Badge>
				<Badge variant="interactive-secondary">Trending</Badge>
				<Badge variant="interactive">New</Badge>
				<Badge variant="interactive-outline">Premium</Badge>
			</div>
			{/* Categories and counts */}
			<div className="flex gap-2">
				<Badge variant="outline">Documentation</Badge>
				<Badge variant="outline">Tutorial</Badge>
				<Badge variant="accent">5 new</Badge>
			</div>
		</div>
	),
};

interface WithIconsProps {
	size: BadgeProps['size'];
	onlineVariant: BadgeProps['variant'];
	newVariant: BadgeProps['variant'];
	warningVariant: BadgeProps['variant'];
	onlineText: string;
	newText: string;
	warningText: string;
}

/**
 * Example of badges with icons.
 * Icons can be added as children of the Badge component.
 */
export const WithIcons: StoryObj<WithIconsProps> = {
	args: {
		size: 'md',
		onlineVariant: 'interactive',
		newVariant: 'interactive',
		warningVariant: 'destructive',
		onlineText: 'Online',
		newText: 'New',
		warningText: 'Warning',
	},
	argTypes: {
		onlineVariant: {
			control: 'select',
			options: ['default', 'secondary', 'destructive', 'outline', 'interactive', 'interactive-accent'],
		},
		newVariant: {
			control: 'select',
			options: ['default', 'secondary', 'destructive', 'outline', 'interactive', 'interactive-accent'],
		},
		warningVariant: {
			control: 'select',
			options: ['default', 'secondary', 'destructive', 'outline', 'interactive', 'interactive-accent'],
		},
		size: {
			control: 'select',
			options: ['sm', 'md', 'lg'],
		},
	},
	render: (args) => (
		<div className="flex gap-4">
			<Badge variant={args.onlineVariant} size={args.size}>
				<CheckCircleIcon className="mr-1 h-4 w-4" /> {args.onlineText}
			</Badge>
			<Badge variant={args.newVariant} size={args.size}>
				{args.newText} <ArrowRightIcon className="ml-1 h-4 w-4" />
			</Badge>
			<Badge variant={args.warningVariant} size={args.size}>
				<ExclamationTriangleIcon className="mr-1 h-4 w-4" /> {args.warningText}
			</Badge>
		</div>
	),
};

/**
 * Example of customizing badges using className prop.
 * While we recommend using the built-in variants and sizes,
 * you can still customize badges using Tailwind classes when needed.
 */
export const CustomStyling: Story = {
	render: () => (
		<div className="flex gap-4">
			<Badge className="bg-blue-500 hover:bg-blue-600">Custom Blue</Badge>
			<Badge className="border-2 border-green-500 text-green-500">Custom Border</Badge>
			<Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Gradient</Badge>
		</div>
	),
};

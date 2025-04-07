import { LinkIcon } from '@heroicons/react/24/outline';
import type { Meta, StoryObj } from '@storybook/react';
import { linkCn } from '../components/typography';

function getIconSizeClassByLinkSize(size: string | undefined) {
	switch (size) {
		case 'sm':
			return 'h-3 w-3';
		case 'md':
			return 'h-4 w-4';
		case 'lg':
			return 'h-5 w-5';
		case 'xl':
			return 'h-6 w-6';
		case '4xl':
			return 'h-7 w-7';
		default:
			return 'h-4 w-4'; // default size
	}
}

const meta = {
	title: 'Typography/Links',
	tags: ['autodocs'],
	parameters: {
		layout: 'centered',
		docs: {
			description: {
				component:
					'A collection of link components with various styles and behaviors. Links can be customized with different variants (default, accent, destructive), sizes, underline styles, font weights, and optional icons or arrows (internal → or external ↗).',
			},
		},
	},
} satisfies Meta;

export default meta;
interface LinkStoryProps {
	children: string;
	variant?: 'default' | 'accent' | 'destructive';
	size?: 'inherit' | 'sm' | 'md' | 'lg' | 'xl' | '4xl';
	weight?: 'regular' | 'medium' | 'semibold' | 'bold';
	underline?: 'none' | 'hover' | 'always';
	icon?: boolean;
	arrow?: false | 'internal' | 'external';
}

type Story = StoryObj<typeof meta & { args: LinkStoryProps }>;

const Template = () => {
	return (
		<div className="flex flex-col space-y-8 p-8">
			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Default Links</h3>
				<div className="space-x-4">
					<a href="#" className={linkCn()}>
						Default Link
					</a>
					<a href="#" className={linkCn({ underline: 'none' })}>
						No Underline
					</a>
					<a href="#" className={linkCn({ underline: 'hover' })}>
						Underline on hover
					</a>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Link Variants</h3>
				<div className="space-x-4">
					<a href="#" className={linkCn({ variant: 'default' })}>
						Default
					</a>
					<a href="#" className={linkCn({ variant: 'accent' })}>
						Accent
					</a>
					<a href="#" className={linkCn({ variant: 'destructive' })}>
						Destructive
					</a>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">Link Sizes</h3>
				<div className="space-x-4">
					<a href="#" className={linkCn({ size: 'sm' })}>
						Small
					</a>
					<a href="#" className={linkCn({ size: 'md' })}>
						Medium
					</a>
					<a href="#" className={linkCn({ size: 'lg' })}>
						Large
					</a>
					<a href="#" className={linkCn({ size: 'xl' })}>
						Extra Large
					</a>
					<a href="#" className={linkCn({ size: '4xl' })}>
						4XL
					</a>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">With Icons</h3>
				<div className="space-x-4">
					<a href="#" className={linkCn({ icon: true })}>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
						Link with Icon
					</a>
					<a href="#" className={linkCn({ variant: 'accent', icon: true })}>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
							/>
						</svg>
						Accent Link with Icon
					</a>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-semibold">With Arrows</h3>
				<div className="space-x-4">
					<a href="#" className={linkCn({ arrow: 'internal', underline: 'none' })}>
						Internal Link
					</a>
					<a href="#" className={linkCn({ arrow: 'external', underline: 'none' })}>
						External Link
					</a>
					<a href="#" className={linkCn({ variant: 'accent', arrow: 'internal', underline: 'none' })}>
						Accent Arrow
					</a>
					<a href="#" className={linkCn({ variant: 'accent', arrow: 'external', underline: 'none' })}>
						Accent External
					</a>
				</div>
			</div>
		</div>
	);
};

export const Default: Story = {
	render: Template,
	parameters: {
		layout: 'centered',
		docs: {
			source: {
				code: false,
			},
		},
	},
};

export const BasicUsage: Story = {
	render: () => (
		<div className="space-x-4">
			<a href="#" className={linkCn()}>
				Default Link
			</a>
			<a href="#" className={linkCn({ variant: 'accent' })}>
				Accent Link
			</a>
			<a href="#" className={linkCn({ variant: 'destructive' })}>
				Destructive Link
			</a>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Basic link variants with default styling. Links can be default, accent, or destructive.',
			},
		},
	},
};

export const StyleVariations: Story = {
	render: () => (
		<div className="space-x-4">
			<a href="#" className={linkCn({ underline: 'none' })}>
				No Underline
			</a>
			<a href="#" className={linkCn({ underline: 'hover' })}>
				Hover Underline
			</a>
			<a href="#" className={linkCn({ size: 'lg' })}>
				Large Link
			</a>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Links can be customized with different underline behaviors and sizes.',
			},
		},
	},
};

export const WithDecorations: Story = {
	render: () => (
		<div className="space-x-4">
			<a href="#" className={linkCn({ icon: true })}>
				<LinkIcon className="h-4 w-4" />
				With Icon
			</a>
			<a href="#" className={linkCn({ arrow: 'internal', underline: 'none' })}>
				Internal Link
			</a>
			<a href="#" className={linkCn({ arrow: 'external', underline: 'none' })}>
				External Link
			</a>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: 'Links can include icons and arrows. Arrows are added automatically via CSS and animate on hover.',
			},
		},
	},
};

interface WithControlsProps extends LinkStoryProps {}

export const WithControls: StoryObj<WithControlsProps> = {
	args: {
		children: 'Interactive Link',
		variant: 'default',
		size: 'md',
		weight: 'regular',
		underline: 'none',
		icon: false,
		arrow: false,
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'accent', 'destructive'],
		},
		size: {
			control: 'select',
			options: ['inherit', 'sm', 'md', 'lg', 'xl', '4xl'],
		},
		weight: {
			control: 'select',
			options: ['regular', 'medium', 'semibold', 'bold'],
			description: 'Font weight of the link',
		},
		underline: {
			control: 'select',
			options: ['none', 'hover', 'always'],
		},
		icon: {
			control: 'boolean',
		},
		arrow: {
			control: 'select',
			options: [false, 'internal', 'external'],
		},
	},
	parameters: {
		layout: 'centered',
		docs: {
			source: {
				code: false,
			},
		},
	},
	render: (args) => (
		<div className="p-8">
			<a
				href="#"
				className={linkCn({
					variant: args.variant,
					size: args.size,
					weight: args.weight,
					underline: args.underline,
					icon: args.icon,
					arrow: args.arrow,
				})}
			>
				{args.icon && (
					<svg className={getIconSizeClassByLinkSize(args.size)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
						/>
					</svg>
				)}
				{args.children}
			</a>
		</div>
	),
};

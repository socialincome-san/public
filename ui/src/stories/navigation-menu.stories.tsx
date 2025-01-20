import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
} from '../components/navigation-menu';
import { cn } from '../lib/utils';

const meta = {
	title: 'Components/NavigationMenu',
	component: NavigationMenu,
	tags: ['autodocs'],
} satisfies Meta<typeof NavigationMenu>;

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

// Helper components for the examples
const ListItem = React.forwardRef<React.ElementRef<'a'>, React.ComponentPropsWithoutRef<'a'>>(
	({ className, title, children, ...props }, ref) => {
		return (
			<li>
				<NavigationMenuLink asChild>
					<a
						ref={ref}
						className={cn(
							'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
							className,
						)}
						{...props}
					>
						<div className="text-sm font-medium leading-none">{title}</div>
						<p className="text-muted-foreground line-clamp-2 text-sm leading-snug">{children}</p>
					</a>
				</NavigationMenuLink>
			</li>
		);
	},
);
ListItem.displayName = 'ListItem';

// Basic Navigation Menu
export const Basic: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Getting Started</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-3 p-4">
							<ListItem title="Introduction" href="/docs">
								A quick introduction to the system and its core concepts.
							</ListItem>
							<ListItem title="Installation" href="/docs/installation">
								Step-by-step guide to installing and setting up the system.
							</ListItem>
							<ListItem title="Typography" href="/docs/typography">
								Styles for headings, paragraphs, lists, and more.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

// Multiple Sections
export const MultipleSections: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[500px] grid-cols-2 gap-3 p-6">
							<li className="row-span-3">
								<NavigationMenuLink asChild>
									<a
										className="from-muted/50 to-muted flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b p-6 no-underline outline-none focus:shadow-md"
										href="/"
									>
										<div className="mb-2 mt-4 text-lg font-medium">Featured Product</div>
										<p className="text-muted-foreground text-sm leading-tight">
											Discover our latest and most innovative product.
										</p>
									</a>
								</NavigationMenuLink>
							</li>
							<ListItem title="Product A" href="/products/a">
								Description of Product A and its features.
							</ListItem>
							<ListItem title="Product B" href="/products/b">
								Description of Product B and its features.
							</ListItem>
							<ListItem title="Product C" href="/products/c">
								Description of Product C and its features.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Resources</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-3 p-4">
							<ListItem title="Documentation" href="/docs">
								Comprehensive guides and API references.
							</ListItem>
							<ListItem title="Blog" href="/blog">
								Latest news, updates, and articles.
							</ListItem>
							<ListItem title="Community" href="/community">
								Join our growing community of developers.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

// With Active States
export const WithActiveStates: Story = {
	render: () => (
		<NavigationMenu>
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuLink
						className={cn(
							'bg-muted text-muted-foreground hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
						)}
						href="/"
					>
						Home
					</NavigationMenuLink>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Products</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="grid w-[400px] gap-3 p-4">
							<ListItem title="Active Item" href="/active" className="bg-accent">
								This item is currently active.
							</ListItem>
							<ListItem title="Regular Item" href="/regular">
								This is a regular item.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

// Custom Styled
export const CustomStyled: Story = {
	render: () => (
		<NavigationMenu className="bg-primary text-primary-foreground rounded-lg">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger className="text-primary-foreground hover:bg-primary-muted data-[state=open]:bg-primary-muted">
						Custom Menu
					</NavigationMenuTrigger>
					<NavigationMenuContent>
						<ul className="bg-primary text-primary-foreground grid w-[400px] gap-3 p-4">
							<ListItem title="Custom Item" href="/custom" className="hover:bg-primary-muted">
								Custom styled navigation item.
							</ListItem>
						</ul>
					</NavigationMenuContent>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	),
};

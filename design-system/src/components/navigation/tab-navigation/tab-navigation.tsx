import { cva } from 'class-variance-authority';
import Link from 'next/link';

export type TabNavigationLink = {
	href: string;
	label: string;
	active: boolean;
};

export type TabNavigationProps = {
	links: TabNavigationLink[];
	// `segmented` looks like `Tabs`, for switching between sibling pages
	variant?: 'pills' | 'segmented';
	// Names the navigation for screen readers when a page has several
	label?: string;
};

const navVariants = cva('', {
	variants: {
		variant: {
			pills: 'mb-9 flex gap-6 overflow-x-auto',
			segmented:
				'bg-muted inline-grid h-10 max-w-full auto-cols-fr grid-flow-col items-center overflow-x-auto rounded-full p-[3px]',
		},
	},
});

const tabVariants = cva('flex items-center text-center text-sm font-medium transition-colors', {
	variants: {
		variant: {
			pills: 'rounded-full px-2.5 py-2',
			segmented:
				'text-foreground focus-visible:ring-ring/50 h-full justify-center rounded-full px-4 whitespace-nowrap focus-visible:ring-[3px] focus-visible:outline-none',
		},
		active: {
			true: '',
			false: '',
		},
	},
	compoundVariants: [
		{ variant: 'pills', active: true, className: 'bg-primary text-primary-foreground' },
		{ variant: 'pills', active: false, className: 'hover:bg-accent' },
		{ variant: 'segmented', active: true, className: 'bg-background shadow-xs' },
		{ variant: 'segmented', active: false, className: 'hover:bg-background/60' },
	],
});

export const TabNavigation = ({ links, variant = 'pills', label }: TabNavigationProps) => (
	<nav aria-label={label} className={navVariants({ variant })}>
		{links.map(({ href, label: linkLabel, active }) => (
			<Link
				key={href}
				href={href}
				aria-current={active ? 'page' : undefined}
				scroll={variant === 'segmented' ? false : undefined}
				className={tabVariants({ variant, active })}
			>
				{linkLabel}
			</Link>
		))}
	</nav>
);

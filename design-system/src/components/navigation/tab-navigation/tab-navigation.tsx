import { cva } from 'class-variance-authority';
import Link from 'next/link';

export type TabNavigationLink = {
	href: string;
	label: string;
	active: boolean;
};

export type TabNavigationProps = {
	links: TabNavigationLink[];
};

const tabVariants = cva('flex items-center rounded-full px-2.5 py-2 text-center text-sm font-medium transition-colors', {
	variants: {
		active: {
			true: 'bg-primary text-primary-foreground font-medium',
			false: 'hover:bg-accent',
		},
	},
});

export const TabNavigation = ({ links }: TabNavigationProps) => (
	<nav className="mb-9 flex gap-6 overflow-x-auto">
		{links.map(({ href, label, active }) => (
			<Link key={href} href={href} aria-current={active ? 'page' : undefined} className={tabVariants({ active })}>
				{label}
			</Link>
		))}
	</nav>
);

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type Section = {
	href: string;
	label: string;
};

type TabNavigationProps = {
	sections: Section[];
};

export function TabNavigation({ sections }: TabNavigationProps) {
	const pathname = usePathname();

	const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

	return (
		<nav className="mb-9 flex gap-6 overflow-x-auto">
			{sections.map((section) => {
				const active = isActive(section.href);
				return (
					<Link
						key={section.href}
						href={section.href}
						aria-current={active ? 'page' : undefined}
						className={[
							'block rounded-full px-2.5 py-2 text-sm font-medium transition-colors',
							active ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent',
						].join(' ')}
					>
						{section.label}
					</Link>
				);
			})}
		</nav>
	);
}

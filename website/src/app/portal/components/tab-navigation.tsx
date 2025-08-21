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
		<nav className="mb-4 border-b border-gray-200">
			<ul className="flex gap-6 overflow-x-auto">
				{sections.map((section) => {
					const active = isActive(section.href);
					return (
						<li key={section.href}>
							<Link
								href={section.href}
								aria-current={active ? 'page' : undefined}
								className={[
									'inline-block pb-2',
									active
										? 'border-b-2 border-blue-500 font-medium text-gray-900'
										: 'text-gray-600 hover:border-b-2 hover:border-blue-500 hover:text-gray-900',
								].join(' ')}
							>
								{section.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}

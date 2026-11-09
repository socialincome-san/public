'use client';

import { TabNavigation as TabNavigationLinks } from '@socialincome/design-system/navigation/tab-navigation/tab-navigation';
import { usePathname } from 'next/navigation';

type Section = {
	href: string;
	label: string;
};

type TabNavigationProps = {
	sections: Section[];
};

export const TabNavigation = ({ sections }: TabNavigationProps) => {
	const pathname = usePathname();

	return (
		<TabNavigationLinks
			links={sections.map(({ href, label }) => ({
				href,
				label,
				active: pathname === href || pathname.startsWith(`${href}/`) || pathname.endsWith(href),
			}))}
		/>
	);
};

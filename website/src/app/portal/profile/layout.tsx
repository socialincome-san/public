import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

import { ReactNode } from 'react';

type ProfileLayoutProps = {
	children: ReactNode;
};

export default function ProfileLayout({ children }: ProfileLayoutProps) {
	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
		{ href: '/portal/profile/account', label: 'Profile' },
	];

	const sections = [
		{ href: '/portal/profile/account', label: 'Account' },
		{ href: '/portal/profile/organization', label: 'Organization' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Profile</h1>
			<TabNavigation sections={sections} />

			<Card>{children}</Card>
		</>
	);
}

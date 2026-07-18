import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { Card } from '@/components/card';
import { TabNavigation } from '@/components/tab-navigation';

import { getAuthenticatedUserOrRedirect, requireAdmin } from '@/lib/firebase/current-user';
import { ReactNode } from 'react';

type MessagingLayoutProps = {
	children: ReactNode;
};

export default async function MessagingLayout({ children }: MessagingLayoutProps) {
	const user = await getAuthenticatedUserOrRedirect();
	requireAdmin(user);

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
		{ href: '/portal/messaging/overview', label: 'Messaging' },
	];

	const sections = [
		{ href: `/portal/messaging/overview`, label: 'Overview' },
		{ href: `/portal/messaging/log`, label: 'Log' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<h1 className="py-8 text-5xl">Messaging</h1>

			<TabNavigation sections={sections} />

			<Card>
				<div>{children}</div>
			</Card>
		</>
	);
}

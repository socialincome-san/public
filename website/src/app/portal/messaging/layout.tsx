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
		{ href: '/portal/messaging/templates', label: 'Messaging' },
	];

	const sections = [
		{ href: `/portal/messaging/templates`, label: 'Templates' },
		{ href: `/portal/messaging/delivery-log`, label: 'Delivery log' },
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

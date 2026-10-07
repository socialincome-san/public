import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { requireAdmin } from '@/server/session';
import { ReactNode } from 'react';

type MessagingLayoutProps = {
	children: ReactNode;
};

export default async function MessagingLayout({ children }: MessagingLayoutProps) {
	await requireAdmin();

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
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">Messaging</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

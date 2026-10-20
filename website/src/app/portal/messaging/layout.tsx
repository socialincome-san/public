import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { requireAdmin } from '@/server/session';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

type MessagingLayoutProps = {
	children: ReactNode;
};

export default async function MessagingLayout({ children }: MessagingLayoutProps) {
	await requireAdmin();
	const t = await getTranslations('portal-messaging');

	const breadcrumbLinks = [
		{ href: '/', label: t('layout.website') },
		{ href: '/portal', label: t('layout.portal') },
		{ href: '/portal/messaging/templates', label: t('layout.title') },
	];

	const sections = [
		{ href: `/portal/messaging/templates`, label: t('layout.templates') },
		{ href: `/portal/messaging/delivery-log`, label: t('layout.deliveryLog') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('layout.title')}</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

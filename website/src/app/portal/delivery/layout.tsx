import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type MonitoringLayoutProps = {
	children: ReactNode;
};

export default async function DeliveryLayout({ children }: MonitoringLayoutProps) {
	const user = await requireSession('user');
	if (!user.hasAnyOperatorProgramAccess) {
		redirect('/portal/programs');
	}
	const t = await getPortalOperationsTranslations();

	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: '/portal/delivery', label: t('delivery.title') },
	];

	const sections = [
		{ href: '/portal/delivery/overview', label: t('navigation.overview') },
		{ href: '/portal/delivery/payouts', label: t('delivery.payouts.label') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('delivery.title')}</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

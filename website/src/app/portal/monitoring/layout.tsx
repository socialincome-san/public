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

export default async function MonitoringLayout({ children }: MonitoringLayoutProps) {
	const user = await requireSession('user');
	if (!user.hasAnyOperatorProgramAccess) {
		redirect('/portal/programs');
	}
	const t = await getPortalOperationsTranslations();

	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: '/portal/monitoring', label: t('monitoring.title') },
	];

	const sections = [
		{ href: `/portal/monitoring/payout-confirmation`, label: t('monitoring.payout_confirmation') },
		{ href: `/portal/monitoring/upcoming-surveys`, label: t('monitoring.upcoming_surveys') },
		{ href: `/portal/monitoring/upcoming-onboarding`, label: t('monitoring.upcoming_onboarding') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('monitoring.title')}</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

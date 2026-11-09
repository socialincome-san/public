import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireSession } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';

type ManagementLayoutProps = {
	children: ReactNode;
};

export default async function ManagementLayout({ children }: ManagementLayoutProps) {
	const t = await getTranslations('portal-management');
	const user = await requireSession('user');
	if (!user.hasAnyOperatorProgramAccess) {
		redirect('/portal/programs');
	}

	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: '/portal/management', label: t('navigation.management') },
	];

	const sections = [
		// Program access–based
		{ href: `/portal/management/recipients`, label: t('navigation.recipients') },
		{ href: `/portal/management/ongoing-payouts`, label: t('navigation.ongoingPayouts') },
		{ href: `/portal/management/surveys`, label: t('navigation.surveys') },

		// Organization access–based
		{ href: `/portal/management/contributors`, label: t('navigation.contributors') },
		{ href: `/portal/management/contributions`, label: t('navigation.contributions') },
		{ href: `/portal/management/subscriptions`, label: t('navigation.subscriptions') },
		{ href: `/portal/management/donation-certificates`, label: t('navigation.donationCertificates') },
		{ href: `/portal/management/campaigns`, label: t('navigation.campaigns') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('navigation.management')}</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

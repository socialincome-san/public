import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { ReactNode } from 'react';

type ProfileLayoutProps = {
	children: ReactNode;
};

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
	const t = await getPortalOperationsTranslations();
	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: '/portal/profile/account', label: t('profile.title') },
	];

	const sections = [
		{ href: '/portal/profile/account', label: t('profile.account') },
		{ href: '/portal/profile/organization', label: t('profile.organization') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('profile.title')}</h1>
				<TabNavigation sections={sections} />

				<Card>{children}</Card>
			</BlockWrapper>
		</>
	);
}

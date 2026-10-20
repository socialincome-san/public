import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { requireAdmin } from '@/server/session';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { getTranslations } from 'next-intl/server';
import { ReactNode } from 'react';

type AdminLayoutProps = {
	children: ReactNode;
};

export default async function AdminLayout({ children }: AdminLayoutProps) {
	await requireAdmin();
	const t = await getTranslations('portal-admin');

	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: '/portal/admin', label: t('navigation.admin') },
	];

	const sections = [
		{ href: '/portal/admin/organizations', label: t('navigation.organizations') },
		{ href: '/portal/admin/users', label: t('navigation.users') },
		{ href: '/portal/admin/local-partners', label: t('navigation.localPartners') },
		{ href: '/portal/admin/candidates', label: t('navigation.candidatePool') },
		{ href: '/portal/admin/expenses', label: t('navigation.expenses') },
		{ href: '/portal/admin/exchange-rates', label: t('navigation.exchangeRates') },
		{ href: '/portal/admin/countries', label: t('navigation.countries') },
		{ href: '/portal/admin/focuses', label: t('navigation.focuses') },
		{ href: '/portal/admin/mobile-money-providers', label: t('navigation.mobileMoneyProviders') },
		{ href: '/portal/admin/sent-mails', label: t('navigation.sentEmails') },
		{ href: '/portal/admin/audit-log', label: t('navigation.auditLog') },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<h1 className="py-8 text-5xl">{t('navigation.admin')}</h1>

				<TabNavigation sections={sections} />

				<Card>
					<div>{children}</div>
				</Card>
			</BlockWrapper>
		</>
	);
}

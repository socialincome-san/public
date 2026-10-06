import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { Card } from '@socialincome/design-system/data-display/card/card';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';

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
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<h1 className="py-8 text-5xl">Profile</h1>
				<TabNavigation sections={sections} />

				<Card>{children}</Card>
			</BlockWrapper>
		</>
	);
}

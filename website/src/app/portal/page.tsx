import { UserPrograms } from '@/app/portal/user-programs';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { requireSession } from '@/server/session';
import { BlockWrapper } from '@socialincome/design-system/block-wrapper/block-wrapper';
import { Suspense } from 'react';

export default function PortalPage() {
	return (
		<Suspense>
			<PortalDataLoader />
		</Suspense>
	);
}

const PortalDataLoader = async () => {
	const user = await requireSession('user');

	const breadcrumbLinks = [
		{ href: '/', label: 'Website' },
		{ href: '/portal', label: 'Portal' },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper disableMarginTop={true} disableMarginBottom={true}>
				<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
					<h1 data-testid="welcome-message-portal" className="py-8 text-5xl">
						Welcome back {user.firstName} 👋
					</h1>
				</div>

				<div className="space-y-16">
					<UserPrograms />
				</div>
			</BlockWrapper>
		</>
	);
};

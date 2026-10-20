import { getPortalOperationsTranslations } from '@/app/portal/portal-operations-server-translations';
import { CountryBadge } from '@/components/badges/country-badge';
import { Breadcrumb } from '@/components/breadcrumb/breadcrumb';
import { TabNavigation } from '@/components/tab-navigation';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getProgramWallet } from '@/modules/programs/program.service';
import { requireSession } from '@/server/session';
import { BlockWrapper } from '@socialincome/design-system/layout/block-wrapper/block-wrapper';
import { ReactNode } from 'react';
import { ProgramSettingsDialog } from './components/program-settings-dialog';

type ProgramLayoutProps = {
	children: ReactNode;
	params: Promise<{ programId: string }>;
};

export default async function ProgramLayout({ children, params }: ProgramLayoutProps) {
	const { programId } = await params;
	const user = await requireSession('user');
	const t = await getPortalOperationsTranslations();

	const result = await getProgramWallet(user.id, programId);

	if (!result.success) {
		return <div className="p-4">{t('program.error_loading_program')}</div>;
	}

	const { programName, country } = result.data;

	const sections = [
		{ href: `/portal/programs/${programId}/overview`, label: t('navigation.overview') },
		{ href: `/portal/programs/${programId}/recipients`, label: t('navigation.recipients') },
		{ href: `/portal/programs/${programId}/payout-forecast`, label: t('program.payout_forecast') },
		{ href: `/portal/programs/${programId}/surveys`, label: t('navigation.surveys') },
	];

	const breadcrumbLinks = [
		{ href: '/', label: t('navigation.website') },
		{ href: '/portal', label: t('navigation.portal') },
		{ href: `/portal/programs/${programId}/recipients`, label: programName },
	];

	return (
		<>
			<Breadcrumb links={breadcrumbLinks} />
			<BlockWrapper marginTop="none" marginBottom="none">
				<div className="flex flex-wrap items-center gap-4 md:flex-row md:items-center">
					<h1 className="py-8 text-5xl">{programName}</h1>

					<CountryBadge country={country} />

					<div className="ml-auto">
						<ProgramSettingsDialog programId={programId} readOnly={result.data.permission === ProgramPermission.owner} />
					</div>
				</div>
				<TabNavigation sections={sections} />
			</BlockWrapper>

			{children}
		</>
	);
}

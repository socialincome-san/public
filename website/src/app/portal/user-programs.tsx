import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { formatWalletAmount } from '@/components/wallet/wallet-format';
import { ProgramPermission } from '@/generated/prisma/enums';
import { getCountryNameByCode } from '@/lib/types/country';
import { getCurrentProgramWalletsAction } from '@/modules/programs/program.actions';
import { Badge } from '@socialincome/design-system/data-display/badge/badge';
import { Wallet } from '@socialincome/design-system/data-display/wallet/wallet';
import { getPortalOperationsTranslations } from './portal-operations-server-translations';

export const UserPrograms = async () => {
	const result = await getCurrentProgramWalletsAction();
	const t = await getPortalOperationsTranslations();

	if (!result.success) {
		return <div>{result.error}</div>;
	}

	const wallets = result.data?.wallets ?? [];

	const operatedPrograms = wallets.filter((p) => p.permission === ProgramPermission.operator);
	const ownedPrograms = wallets.filter((p) => p.permission === ProgramPermission.owner);

	return (
		<section className="space-y-16">
			{operatedPrograms.length > 0 && (
				<div>
					<h2 className="py-6 text-3xl font-medium">{t('portal.operated_programs')}</h2>
					<div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
						{operatedPrograms.map((program) => (
							<Wallet
								key={program.id}
								href={`/portal/programs/${program.id}/overview`}
								title={program.programName}
								subtitle={getCountryNameByCode(program.country)}
								badge={
									!program.isReadyForFirstPayouts ? (
										<Badge variant="secondary">{t('portal.funding_needed')}</Badge>
									) : undefined
								}
								footerLeft={{
									label: t('portal.wallet.paid_out'),
									prefix: program.payoutCurrency,
									value: formatWalletAmount(program.totalPayoutsSum),
								}}
								footerRight={{
									label: t('portal.wallet.recipients'),
									value: formatWalletAmount(program.recipientsCount),
								}}
							/>
						))}
					</div>
				</div>
			)}
			<div>
				<h2 className="py-6 text-3xl font-medium">{t('portal.owned_programs')}</h2>
				<div className="grid grid-cols-1 gap-8 pb-8 sm:grid-cols-2 lg:grid-cols-3">
					{ownedPrograms.map((program) => (
						<Wallet
							key={program.id}
							href={`/portal/programs/${program.id}/overview`}
							title={program.programName}
							subtitle={getCountryNameByCode(program.country)}
							badge={
								!program.isReadyForFirstPayouts ? <Badge variant="secondary">{t('portal.funding_needed')}</Badge> : undefined
							}
							footerLeft={{
								label: t('portal.wallet.paid_out'),
								prefix: program.payoutCurrency,
								value: formatWalletAmount(program.totalPayoutsSum),
							}}
							footerRight={{
								label: t('portal.wallet.recipients'),
								value: formatWalletAmount(program.recipientsCount),
							}}
						/>
					))}
					<CreateProgramModal isAuthenticated trigger={<Wallet variant="empty" title={t('portal.create_program')} />} />
				</div>
			</div>
		</section>
	);
};

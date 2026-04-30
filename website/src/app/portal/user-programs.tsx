import { Badge } from '@/components/badge';
import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Wallet } from '@/components/wallet';
import { ProgramPermission } from '@/generated/prisma/enums';
import { services } from '@/lib/services/services';
import { getCountryNameByCode } from '@/lib/types/country';

type Props = {
	userId: string;
};

export const UserPrograms = async ({ userId }: Props) => {
	const result = await services.read.program.getProgramWallets(userId);

	if (!result.success) {
		return <div>{result.error}</div>;
	}

	const wallets = result.data?.wallets ?? [];

	const operatedPrograms = wallets.filter((p) => p.permission === ProgramPermission.operator);
	const ownedPrograms = wallets.filter((p) => p.permission === ProgramPermission.owner);

	const programImages = [
		'/assets/partners/aurora.png',
		'/assets/partners/lizard-earth.jpg',
		'/assets/partners/rainbo-initiative.jpg',
		'/assets/partners/regina-bjarnadottir-aurora.jpg',
	] as const;

	return (
		<section className="space-y-16">
			{operatedPrograms.length > 0 && (
				<div>
					<h2 className="py-6 text-3xl font-medium">Operated Programs</h2>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
						{operatedPrograms.map((program, idx) => (
							<Wallet
								key={program.id}
								href={`/portal/programs/${program.id}/overview`}
								title={program.programName}
								subtitle={getCountryNameByCode(program.country)}
								badge={!program.isReadyForFirstPayouts ? <Badge variant="secondary">Funding needed</Badge> : undefined}
								footerLeft={{
									label: 'Paid out',
									currency: program.payoutCurrency,
									amount: program.totalPayoutsSum,
								}}
								footerRight={{
									label: 'Recipients',
									amount: program.recipientsCount,
								}}
								imageHrefs={[
									programImages[idx % programImages.length],
									programImages[(idx + 1) % programImages.length],
									programImages[(idx + 2) % programImages.length],
								]}
								imageAlt=""
							/>
						))}
					</div>
				</div>
			)}
			<div>
				<h2 className="py-6 text-3xl font-medium">Owned Programs</h2>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
					{ownedPrograms.map((program) => (
						<Wallet
							key={program.id}
							href={`/portal/programs/${program.id}/overview`}
							title={program.programName}
							subtitle={getCountryNameByCode(program.country)}
							badge={!program.isReadyForFirstPayouts ? <Badge variant="secondary">Funding needed</Badge> : undefined}
							footerLeft={{
								label: 'Paid out',
								currency: program.payoutCurrency,
								amount: program.totalPayoutsSum,
							}}
							footerRight={{
								label: 'Recipients',
								amount: program.recipientsCount,
							}}
						/>
					))}
					<CreateProgramModal isAuthenticated trigger={<Wallet variant="empty" title="Create new program" />} />
				</div>
			</div>
		</section>
	);
};

import { CreateProgramModal } from '@/components/create-program-wizard/create-program-modal';
import { Wallet } from '@/components/wallet';
import { ProgramService } from '@/lib/services/program/program.service';
import { ProgramPermission } from '@prisma/client';

type Props = {
	userId: string;
};

export async function UserPrograms({ userId }: Props) {
	const service = new ProgramService();
	const result = await service.getProgramWallets(userId);

	if (!result.success) {
		return <div>{result.error}</div>;
	}

	const wallets = result.data?.wallets ?? [];

	const operatedPrograms = wallets.filter((p) => p.permission === ProgramPermission.operator);
	const ownedPrograms = wallets.filter((p) => p.permission === ProgramPermission.owner);

	return (
		<section className="space-y-16">
			<div>
				<h2 className="py-6 text-3xl font-medium">Operated Programs</h2>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
					{operatedPrograms.map((program) => (
						<Wallet
							key={program.id}
							href={`/portal/programs/${program.id}/recipients`}
							title={program.programName}
							subtitle={program.country}
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

			{ownedPrograms.length > 0 && (
				<div>
					<h2 className="py-6 text-3xl font-medium">Owned Programs</h2>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
						{ownedPrograms.map((program) => (
							<Wallet
								key={program.id}
								href={`/portal/programs/${program.id}/recipients`}
								title={program.programName}
								subtitle={program.country}
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
					</div>
				</div>
			)}
		</section>
	);
}

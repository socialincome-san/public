import { Wallet } from '@/components/wallet';
import { ProgramPermission } from '@prisma/client';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

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

	const editablePrograms = wallets.filter((p) => p.permission === ProgramPermission.edit);
	const readonlyPrograms = wallets.filter((p) => p.permission === ProgramPermission.readonly);

	return (
		<section className="space-y-16">
			<div>
				<h2 className="py-6 text-3xl font-medium">Your Programs</h2>
				<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
					{editablePrograms.map((program) => (
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

					<Wallet variant="empty" title="Create new program" href="/portal/programs/create" />
				</div>
			</div>

			{readonlyPrograms.length > 0 && (
				<div>
					<h2 className="py-6 text-3xl font-medium">Other Programs (View Only)</h2>
					<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
						{readonlyPrograms.map((program) => (
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

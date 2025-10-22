import { Wallet } from '@/app/portal/components/wallet';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

type Props = {
	userId: string;
};

export async function YourPrograms({ userId }: Props) {
	const service = new ProgramService();
	const result = await service.getProgramWalletView(userId);

	if (!result.success) {
		return <div>{result.error}</div>;
	}

	const wallets = result.data?.wallets ?? [];

	return (
		<section>
			<h2 className="py-6 text-3xl font-medium">Programs you have access to</h2>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
				{wallets.map((program) => (
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

				<Wallet variant="empty" title="Create new program" />
			</div>
		</section>
	);
}

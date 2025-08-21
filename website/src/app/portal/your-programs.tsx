import { Wallet } from '@/app/portal/components/wallet';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

export async function YourPrograms() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getProgramWalletView(user.id);

	if (!result.success) {
		return <div>Error loading programs</div>;
	}

	const wallets = result.data?.wallets ?? [];
	if (wallets.length === 0) {
		return <div>No programs found</div>;
	}

	return (
		<div>
			<h2 className="py-6 text-3xl font-medium">Your programs</h2>
			<div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))' }}>
				{wallets.map((program) => (
					<Wallet
						key={program.id}
						href={`/portal/programs/${program.id}/overview`}
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
		</div>
	);
}

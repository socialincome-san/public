import { Wallet } from '@/app/portal/components/wallet';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

export async function YourPrograms() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getUserAccessiblePrograms(user.id);

	if (!result.success) {
		return <div>Error loading programs</div>;
	}

	const programs = result.data ?? [];

	if (programs.length === 0) {
		return <div>No programs found</div>;
	}

	return (
		<div>
			<h2 className="py-6 text-3xl font-medium">Your programs</h2>
			<div className="grid gap-8" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(20rem, 1fr))' }}>
				{programs.map((program) => (
					<Wallet
						key={program.id}
						href={`/portal/programs/${program.id}/overview`}
						title={program.name}
						subtitle={program.country}
						footerLeft={{
							label: 'Paid out',
							currency: program.payoutCurrency,
							amount: 7350,
						}}
						footerRight={{
							label: 'Recipients',
							amount: 132,
						}}
					/>
				))}

				<Wallet variant="empty" title={'Create new program'} />
			</div>
		</div>
	);
}

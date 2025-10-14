import { Card } from '@/app/portal/components/card';
import { Wallet } from '@/app/portal/components/wallet';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';

export async function YourPrograms() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getProgramWalletView(user.id);

	if (!result.success) {
		return <div>{result.error}</div>;
	}

	const wallets = result.data?.wallets ?? [];
	if (wallets.length === 0) {
		return <div>No programs found</div>;
	}

	const myPrograms = wallets.filter((program) => program.permission === 'edit');
	const otherPrograms = wallets.filter((program) => program.permission === 'readonly');

	const subgridClasses = 'row-span-2 grid grid-rows-subgrid';

	return (
		<>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
				{myPrograms.map((program) => (
					<div key={program.id} className={subgridClasses}>
						{program === myPrograms[0] ? <h2 className="py-6 text-3xl font-medium">Your programs</h2> : <span></span>}

						<Wallet
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
					</div>
				))}

				<div className={subgridClasses}>
					<span></span>
					<Wallet variant="empty" title="Create new program" />
				</div>

				<div className={subgridClasses}>
					<h2 className="py-6 text-3xl font-medium">Finances</h2>
					<Card />
				</div>
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(30rem,1fr))] gap-8 pb-8">
				<div className={subgridClasses}>
					<h2 className="py-6 text-3xl font-medium">Finances</h2>
					<Card />
				</div>
				<div className={subgridClasses}>
					<span></span>
					<Card />
				</div>
			</div>

			<div className="grid grid-cols-[repeat(auto-fill,minmax(20rem,1fr))] gap-8 pb-8">
				{otherPrograms.map((program) => (
					<div key={program.id} className={subgridClasses}>
						{program === otherPrograms[0] ? (
							<h2 className="py-6 text-3xl font-medium">Other programs</h2>
						) : (
							<span></span>
						)}

						<Wallet
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
					</div>
				))}
			</div>
		</>
	);
}

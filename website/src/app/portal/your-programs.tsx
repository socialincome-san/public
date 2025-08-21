import { CardContent, CardTitle } from '@/app/portal/components/card';
import { Wallet } from '@/app/portal/components/wallet';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';
import Link from 'next/link';

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
					<Link href={`/portal/programs/${program.id}/overview`} key={program.id}>
						<Wallet key={program.id}>
							<CardContent className="h-full p-8 pb-6 pt-0">
								<div className="flex h-full w-full flex-col items-start justify-between gap-2">
									<div>
										<h3 className="text-4xl font-normal leading-[1.3]">
											{program.name} ({program.programPermission === 'viewer' ? 'read-only' : 'editable'})
										</h3>
										<p className="text-sm font-medium tracking-wide">Sierra Leone</p>
									</div>
									<div className="flex w-full items-start justify-between">
										<div className="flex flex-col items-start">
											<p className="text-sm font-medium tracking-wide">Paid out</p>
											<p className="text-4xl font-normal">
												<small className="text-lg">USD</small> 7,350
											</p>
										</div>
										<div className="flex flex-col items-end">
											<p className="text-sm font-medium tracking-wide">Recipients</p>
											<p className="text-4xl font-normal">132</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Wallet>
					</Link>
				))}

				<Wallet variant="empty">
					<CardContent>
						<CardTitle>Create new program</CardTitle>
					</CardContent>
				</Wallet>
			</div>
		</div>
	);
}

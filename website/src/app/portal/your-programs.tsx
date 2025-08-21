import { Card, CardContent, CardTitle } from '@/app/portal/components/card';
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
				<Card>
					<CardContent>Portal card</CardContent>
				</Card>
				<div>
					<Card>
						<div className="flex h-full w-full flex-col items-start justify-between pb-6 pl-8 pr-8 pt-20">
							<div className="flex flex-col items-start">
								<h2 className="text-4xl font-normal">Old Widows</h2>
								<p className="text-sm font-medium tracking-wide">Sierra Leone</p>
							</div>
							<div className="flex w-full items-start justify-between">
								<div className="flex flex-col items-start">
									<p className="text-sm font-medium tracking-wide">Paid out</p>
									<p className="text-4xl font-normal">USD 7,350</p>
								</div>
								<div className="flex flex-col items-end">
									<p className="text-sm font-medium tracking-wide">Recipients</p>
									<p className="text-4xl font-normal">132</p>
								</div>
							</div>
						</div>
					</Card>
				</div>
				{programs.map((program) => (
					<Wallet key={program.id}>
						<CardContent>
							<Link href={`/portal/programs/${program.id}/overview`}>{program.name}</Link> (
							{program.programPermission === 'viewer' ? 'read-only' : 'editable'})
						</CardContent>
					</Wallet>
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

import { Wallet } from '@/app/portal/components/custom/wallet';
import { CardContent, CardTitle } from '@/app/portal/components/ui/card';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';
import Link from 'next/link';

export async function YourPrograms() {
	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getProgramsByUserId(user.id);

	if (!result.success) {
		return <div>Error loading programs</div>;
	}

	const programs = result.data ?? [];

	if (programs.length === 0) {
		return <div>No programs found</div>;
	}

	return (
		<div>
			<h2>Your programs</h2>
			<div className="grid grid-cols-3 gap-8">
				{programs.map((program) => (
					<Wallet key={program.id}>
						<CardContent>
							<Link href={`/portal/programs/${program.id}/overview`}>{program.name}</Link>
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

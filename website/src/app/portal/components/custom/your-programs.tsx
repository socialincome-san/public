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
			<ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem' }}>
				{programs.map((program) => (
					<li key={program.id}>
						<Link href={`/portal/programs/${program.id}/overview`}>{program.name}</Link>
					</li>
				))}
			</ul>
		</div>
	);
}

// app/portal/programs/[programId]/layout.tsx
import { TabNavigation } from '@/app/portal/components/custom/tab-navigation';
import { getAuthenticatedUserOrRedirect } from '@/lib/firebase/current-user';
import { ProgramService } from '@socialincome/shared/src/database/services/program/program.service';
import { ReactNode } from 'react';

type ProgramLayoutProps = {
	children: ReactNode;
	params: Promise<{ programId: string }>;
};

export default async function ProgramLayout({ children, params }: ProgramLayoutProps) {
	const { programId } = await params;

	const user = await getAuthenticatedUserOrRedirect();

	const service = new ProgramService();
	const result = await service.getProgramByIdAndUserId(programId, user.id);

	if (!result.success) {
		return <div className="p-4">Fehler beim Laden des Programms</div>;
	}

	const program = result.data;

	return (
		<div className="p-4">
			<h1 className="mb-4 text-2xl font-bold">{program.name}</h1>
			<TabNavigation programId={program.id} />
			<div className="mt-4">{children}</div>
		</div>
	);
}

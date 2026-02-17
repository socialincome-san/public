import { ProgramSetupSuccess } from './program-setup-success';
import { SectionTitle } from './section-title';

type ProgramSetupSectionProps = { programId: string; publicUrl: string };

export function ProgramSetupSection({ programId, publicUrl }: ProgramSetupSectionProps) {
	return (
		<div className="space-y-4">
			<SectionTitle>Program Setup</SectionTitle>
			<ProgramSetupSuccess programId={programId} publicUrl={publicUrl} />
		</div>
	);
}

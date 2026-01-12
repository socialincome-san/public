'use client';

import { Cause } from '@prisma/client';
import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: 'social_income' | 'self_run' | null;
	recipientApproach: 'universal' | 'targeted' | null;
	targetCauses: Cause[];
	onSelectProgramManagement: (value: 'social_income' | 'self_run') => void;
	onSelectRecipientApproach: (value: 'universal' | 'targeted') => void;
	onToggleCause: (cause: Cause) => void;
};

export function ProgramSetupStep({
	programManagement,
	recipientApproach,
	targetCauses,
	onSelectProgramManagement,
	onSelectRecipientApproach,
	onToggleCause,
}: Props) {
	return (
		<div className="space-y-8">
			<ProgramManagementSection value={programManagement} onChange={onSelectProgramManagement} />
			<RecipientSelectionSection
				value={recipientApproach}
				targetCauses={targetCauses}
				onChangeApproach={onSelectRecipientApproach}
				onToggleCause={onToggleCause}
			/>
		</div>
	);
}

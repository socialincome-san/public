'use client';

import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: 'social_income' | 'self_run' | null;
	recipientApproach: 'universal' | 'targeted' | null;
	onSelectProgramManagement: (value: 'social_income' | 'self_run') => void;
	onSelectRecipientApproach: (value: 'universal' | 'targeted') => void;
};

export function ProgramSetupStep({
	programManagement,
	recipientApproach,
	onSelectProgramManagement,
	onSelectRecipientApproach,
}: Props) {
	return (
		<div className="space-y-8">
			<ProgramManagementSection value={programManagement} onChange={onSelectProgramManagement} />
			<RecipientSelectionSection value={recipientApproach} onChange={onSelectRecipientApproach} />
		</div>
	);
}

'use client';

import { Cause } from '@/generated/prisma/client';
import { ProgramManagementType, RecipientApproachType } from '../wizard/types';
import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: ProgramManagementType | null;
	recipientApproach: RecipientApproachType | null;
	targetCauses: Cause[];
	onSelectProgramManagement: (value: ProgramManagementType) => void;
	onSelectRecipientApproach: (value: RecipientApproachType) => void;
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

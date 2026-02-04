'use client';

import { Profile } from '@/lib/services/candidate/candidate.types';
import { Cause } from '@prisma/client';
import { ProgramManagementType, RecipientApproachType } from '../wizard/types';
import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: ProgramManagementType | null;
	recipientApproach: RecipientApproachType | null;
	targetCauses: Cause[];
	targetProfiles: Profile[];
	onSelectProgramManagement: (value: ProgramManagementType) => void;
	onSelectRecipientApproach: (value: RecipientApproachType) => void;
	onToggleCause: (cause: Cause) => void;
	onToggleProfile: (profile: Profile) => void;
};

export function ProgramSetupStep({
	programManagement,
	recipientApproach,
	targetCauses,
	targetProfiles,
	onSelectProgramManagement,
	onSelectRecipientApproach,
	onToggleCause,
	onToggleProfile,
}: Props) {
	return (
		<div className="space-y-8">
			<ProgramManagementSection value={programManagement} onChange={onSelectProgramManagement} />

			<RecipientSelectionSection
				value={recipientApproach}
				targetCauses={targetCauses}
				targetProfiles={targetProfiles}
				onChangeApproach={onSelectRecipientApproach}
				onToggleCause={onToggleCause}
				onToggleProfile={onToggleProfile}
			/>
		</div>
	);
}

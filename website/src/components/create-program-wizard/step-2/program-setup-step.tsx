'use client';

import { Cause } from '@/generated/prisma/enums';
import { Profile } from '@/lib/services/candidate/candidate.types';
import { ProgramManagementType, RecipientApproachType } from '../wizard/types';
import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: ProgramManagementType | null;
	recipientApproach: RecipientApproachType | null;
	targetCauses: Cause[];
	targetProfiles: Profile[];
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onSelectProgramManagement: (value: ProgramManagementType) => void;
	onSelectRecipientApproach: (value: RecipientApproachType) => void;
	onToggleCause: (cause: Cause) => void;
	onToggleProfile: (profile: Profile) => void;
};

export const ProgramSetupStep = ({
	programManagement,
	recipientApproach,
	targetCauses,
	targetProfiles,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onSelectProgramManagement,
	onSelectRecipientApproach,
	onToggleCause,
	onToggleProfile,
}: Props) => {
	return (
		<div className="space-y-8">
			<ProgramManagementSection value={programManagement} onChange={onSelectProgramManagement} />

			<RecipientSelectionSection
				value={recipientApproach}
				targetCauses={targetCauses}
				targetProfiles={targetProfiles}
				totalRecipients={totalRecipients}
				filteredRecipients={filteredRecipients}
				isCountingRecipients={isCountingRecipients}
				onChangeApproach={onSelectRecipientApproach}
				onToggleCause={onToggleCause}
				onToggleProfile={onToggleProfile}
			/>
		</div>
	);
}

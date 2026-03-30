'use client';

import { Profile } from '@/generated/prisma/enums';
import { ProgramManagementType, RecipientApproachType } from '../wizard/types';
import { ProgramManagementSection } from './program-management-section';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	programManagement: ProgramManagementType | null;
	recipientApproach: RecipientApproachType | null;
	targetFocuses: string[];
	focusOptions: { id: string; name: string }[];
	targetProfiles: Profile[];
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onSelectProgramManagement: (value: ProgramManagementType) => void;
	onSelectRecipientApproach: (value: RecipientApproachType) => void;
	onToggleFocus: (focus: string) => void;
	onToggleProfile: (profile: Profile) => void;
};

export const ProgramSetupStep = ({
	programManagement,
	recipientApproach,
	targetFocuses,
	focusOptions,
	targetProfiles,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onSelectProgramManagement,
	onSelectRecipientApproach,
	onToggleFocus,
	onToggleProfile,
}: Props) => {
	return (
		<div className="space-y-8">
			<ProgramManagementSection value={programManagement} onChange={onSelectProgramManagement} />

			<RecipientSelectionSection
				value={recipientApproach}
				targetFocuses={targetFocuses}
				focusOptions={focusOptions}
				targetProfiles={targetProfiles}
				totalRecipients={totalRecipients}
				filteredRecipients={filteredRecipients}
				isCountingRecipients={isCountingRecipients}
				onChangeApproach={onSelectRecipientApproach}
				onToggleFocus={onToggleFocus}
				onToggleProfile={onToggleProfile}
			/>
		</div>
	);
};

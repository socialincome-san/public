'use client';

import { Profile } from '@/generated/prisma/enums';
import { RecipientApproachType } from '../wizard/types';
import { RecipientSelectionSection } from './recipient-selection-section';

type Props = {
	recipientApproach: RecipientApproachType | null;
	targetFocuses: string[];
	focusOptions: { id: string; name: string }[];
	focusOptionsError?: string;
	targetProfiles: Profile[];
	targetLocalPartnerIds: string[];
	localPartnerOptions: { id: string; name: string }[];
	localPartnerOptionsError?: string;
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onSelectRecipientApproach: (value: RecipientApproachType) => void;
	onToggleFocus: (focus: string) => void;
	onToggleProfile: (profile: Profile) => void;
	onToggleLocalPartner: (localPartnerId: string) => void;
};

export const ProgramSetupStep = ({
	recipientApproach,
	targetFocuses,
	focusOptions,
	focusOptionsError,
	targetProfiles,
	targetLocalPartnerIds,
	localPartnerOptions,
	localPartnerOptionsError,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onSelectRecipientApproach,
	onToggleFocus,
	onToggleProfile,
	onToggleLocalPartner,
}: Props) => {
	return (
		<div>
			<RecipientSelectionSection
				value={recipientApproach}
				targetFocuses={targetFocuses}
				focusOptions={focusOptions}
				focusOptionsError={focusOptionsError}
				targetProfiles={targetProfiles}
				targetLocalPartnerIds={targetLocalPartnerIds}
				localPartnerOptions={localPartnerOptions}
				localPartnerOptionsError={localPartnerOptionsError}
				totalRecipients={totalRecipients}
				filteredRecipients={filteredRecipients}
				isCountingRecipients={isCountingRecipients}
				onChangeApproach={onSelectRecipientApproach}
				onToggleFocus={onToggleFocus}
				onToggleProfile={onToggleProfile}
				onToggleLocalPartner={onToggleLocalPartner}
			/>
		</div>
	);
};

'use client';

import { Badge } from '@/components/badge';
import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Profile } from '@/lib/services/candidate/candidate.types';
import { Cause } from '@prisma/client';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';
import { PillMultiSelect } from './pill-multi-select';

type Props = {
	value: RecipientApproachType | null;
	targetCauses: Cause[];
	targetProfiles: Profile[];
	onChangeApproach: (value: RecipientApproachType) => void;
	onToggleCause: (cause: Cause) => void;
	onToggleProfile: (profile: Profile) => void;
};

export function RecipientSelectionSection({
	value,
	targetCauses,
	targetProfiles,
	onChangeApproach,
	onToggleCause,
	onToggleProfile,
}: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Recipient selection</div>

			<RadioCardGroup value={value ?? ''} onChange={(v) => onChangeApproach(v as RecipientApproachType)}>
				<RadioCard
					value="universal"
					checked={value === 'universal'}
					label="Universal approach"
					description="All eligible recipients receive support."
					badge={<Badge variant="verified">Recommended</Badge>}
				/>

				<RadioCard
					value="targeted"
					checked={value === 'targeted'}
					label="Targeted approach"
					description="Support is provided to candidates who belong to at least one selected group"
				>
					<div className="space-y-4">
						<PillMultiSelect
							label="Causes"
							values={Object.values(Cause)}
							selected={targetCauses}
							onToggle={(value) => onToggleCause(value as Cause)}
						/>
						<PillMultiSelect
							label="Profiles"
							values={Object.values(Profile)}
							selected={targetProfiles}
							onToggle={(value) => onToggleProfile(value as Profile)}
						/>
					</div>
				</RadioCard>

				<RadioCard
					value="custom"
					disabled
					label="Choose your own recipients"
					description="Manually select and manage individual recipients."
					badge={<Badge>Coming soon</Badge>}
				/>
			</RadioCardGroup>
		</div>
	);
}

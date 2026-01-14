'use client';

import { Badge } from '@/components/badge';
import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Cause } from '@prisma/client';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';
import { TargetCauseSelector } from './target-cause-selection';

type Props = {
	value: RecipientApproachType | null;
	targetCauses: Cause[];
	onChangeApproach: (value: RecipientApproachType) => void;
	onToggleCause: (cause: Cause) => void;
};

export function RecipientSelectionSection({ value, targetCauses, onChangeApproach, onToggleCause }: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Recipient selection</div>

			<RadioCardGroup value={value ?? ''} onChange={(v) => onChangeApproach(v as any)}>
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
					description="Support is provided to a specific subgroup."
				>
					<TargetCauseSelector selected={targetCauses} onToggle={onToggleCause} />
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

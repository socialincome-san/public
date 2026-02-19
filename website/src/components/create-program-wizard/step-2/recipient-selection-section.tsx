'use client';

import { Badge } from '@/components/badge';
import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { Cause } from '@/generated/prisma/enums';
import { Profile } from '@/lib/services/candidate/candidate.types';
import { cn } from '@/lib/utils/cn';
import { SpinnerIcon } from '@socialincome/ui';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';
import { PillMultiSelect } from './pill-multi-select';

type Props = {
	value: RecipientApproachType | null;
	targetCauses: Cause[];
	targetProfiles: Profile[];
	totalRecipients: number;
	filteredRecipients: number;
	isCountingRecipients: boolean;
	onChangeApproach: (value: RecipientApproachType) => void;
	onToggleCause: (cause: Cause) => void;
	onToggleProfile: (profile: Profile) => void;
};

export const RecipientSelectionSection = ({
	value,
	targetCauses,
	targetProfiles,
	totalRecipients,
	filteredRecipients,
	isCountingRecipients,
	onChangeApproach,
	onToggleCause,
	onToggleProfile,
}: Props) => {
	const noUniversalRecipients = value === 'universal' && totalRecipients === 0;
	const noTargetedRecipients = value === 'targeted' && filteredRecipients === 0;

	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Recipient selection</div>

			<RadioCardGroup value={value ?? ''} onChange={(v) => onChangeApproach(v as RecipientApproachType)}>
				<RadioCard
					value="universal"
					checked={value === 'universal'}
					label="Universal approach"
					description="All eligible recipients in the selected country receive support."
					badge={<Badge variant="verified">Recommended</Badge>}
				>
					<div className={cn('text-sm', noUniversalRecipients ? 'text-destructive' : 'text-muted-foreground')}>
						{isCountingRecipients ? (
							<SpinnerIcon />
						) : (
							<>
								<span>
									<strong>{totalRecipients.toLocaleString()}</strong> pre-assessed recipients available in this country
								</span>

								{noUniversalRecipients && (
									<div className="mt-1 text-xs">At least one recipient is required to continue.</div>
								)}
							</>
						)}
					</div>
				</RadioCard>

				<RadioCard
					value="targeted"
					checked={value === 'targeted'}
					label="Targeted approach"
					description="Support is provided to recipients who match selected causes and profiles."
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

						<div className={cn('text-sm', noTargetedRecipients ? 'text-destructive' : 'text-muted-foreground')}>
							{isCountingRecipients ? (
								<SpinnerIcon />
							) : (
								<>
									<span>
										<strong>{filteredRecipients.toLocaleString()}</strong> of{' '}
										<strong>{totalRecipients.toLocaleString()}</strong> recipients match the selected country and
										filters
									</span>

									{noTargetedRecipients && (
										<div className="mt-1 text-xs">Please adjust the filters so at least one recipient matches.</div>
									)}
								</>
							)}
						</div>
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
};

'use client';

import { Badge } from '@/components/badge';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';
import type { ProgramManagementType } from '../wizard/types';

type Props = {
	value: ProgramManagementType | null;
	onChange: (value: ProgramManagementType) => void;
};

export const ProgramManagementSection = ({ value, onChange }: Props) => {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Program management</div>

			<RadioCardGroup value={value ?? ''} layout="grid" onChange={(v) => onChange(v as ProgramManagementType)}>
				<RadioCard
					value="social_income"
					checked={value === 'social_income'}
					label="Program run by Social Income"
					description="Social Income manages recipients, payouts, and operations."
				/>

				<RadioCard
					value="self_run"
					disabled
					label="Run the program yourself"
					description="You manage recipients and operations independently."
					badge={<Badge>Coming soon</Badge>}
				/>
			</RadioCardGroup>
		</div>
	);
}

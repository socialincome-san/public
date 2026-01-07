'use client';

import { RecipientApproachType } from '@/components/create-program-wizard/wizard/types';
import { RadioGroup, RadioGroupItem } from '../../radio-group';

type Props = {
	value: RecipientApproachType | null;
	onChange: (value: RecipientApproachType) => void;
};

export function RecipientSelectionSection({ value, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Recipient selection</div>

			<RadioGroup value={value ?? ''} onValueChange={(v) => onChange(v as RecipientApproachType)} className="space-y-3">
				<label className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
					<RadioGroupItem value="universal" />
					<div>
						<p className="font-medium">Universal approach</p>
						<p className="text-muted-foreground text-sm">All eligible recipients receive support.</p>
					</div>
				</label>

				<label className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
					<RadioGroupItem value="targeted" />
					<div>
						<p className="font-medium">Targeted approach</p>
						<p className="text-muted-foreground text-sm">Support is provided to a specific subgroup.</p>
					</div>
				</label>
			</RadioGroup>
		</div>
	);
}

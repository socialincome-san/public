'use client';

import { RadioGroup, RadioGroupItem } from '../../radio-group';

type Props = {
	value: 'social_income' | 'self_run' | null;
	onChange: (value: 'social_income' | 'self_run') => void;
};

export function ProgramManagementSection({ value, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Program management</div>

			<RadioGroup
				value={value ?? ''}
				onValueChange={(v) => onChange(v as 'social_income' | 'self_run')}
				className="space-y-3"
			>
				<label className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
					<RadioGroupItem value="social_income" />
					<div>
						<p className="font-medium">Program run by Social Income</p>
						<p className="text-muted-foreground text-sm">Social Income manages recipients, payouts, and operations.</p>
					</div>
				</label>

				<label className="hover:bg-muted/40 flex cursor-pointer items-start gap-3 rounded-lg border p-4">
					<RadioGroupItem value="self_run" />
					<div>
						<p className="font-medium">Run the program yourself</p>
						<p className="text-muted-foreground text-sm">You manage recipients and operations independently.</p>
					</div>
				</label>
			</RadioGroup>
		</div>
	);
}

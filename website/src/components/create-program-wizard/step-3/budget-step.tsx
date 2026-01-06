'use client';

import { Input } from '../../input';

type Props = {
	value: number | null;
	onChange: (value: number) => void;
};

export function BudgetStep({ value, onChange }: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Budget</div>

			<div className="max-w-sm space-y-2">
				<label className="text-sm font-medium" htmlFor="budget">
					Total program budget
				</label>

				<Input
					id="budget"
					type="number"
					min={0}
					step={1}
					placeholder="Enter amount"
					value={value ?? ''}
					onChange={(e) => {
						const next = Number(e.target.value);
						if (!Number.isNaN(next)) {
							onChange(next);
						}
					}}
				/>

				<p className="text-muted-foreground text-sm">Enter the total budget allocated for this program.</p>
			</div>
		</div>
	);
}

'use client';

import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Switch } from '@/components/switch';

type Props = {
	search: string;
	onSearchChange: (v: string) => void;
	onlyAllMet: boolean;
	onOnlyAllMetChange: (v: boolean) => void;
};

export function CountryTableHeader({ search, onSearchChange, onlyAllMet, onOnlyAllMetChange }: Props) {
	return (
		<div className="flex items-center justify-between">
			<p className="text-sm font-medium">Check cash program feasibility</p>

			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Switch checked={onlyAllMet} onCheckedChange={onOnlyAllMetChange} id="filter-all-met" />
					<Label htmlFor="filter-all-met" className="whitespace-nowrap text-sm">
						All conditions met
					</Label>
				</div>

				<Input
					placeholder="Search"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-8 w-40"
				/>
			</div>
		</div>
	);
}

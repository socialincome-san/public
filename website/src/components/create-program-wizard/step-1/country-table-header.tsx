'use client';

import { Input } from '@/components/input';
import { Label } from '@/components/label';
import { Switch } from '@/components/switch';
import { useRouteTranslator } from '@/lib/hooks/use-route-translator';

type Props = {
	search: string;
	onSearchChange: (v: string) => void;
	onlyAllMet: boolean;
	onOnlyAllMetChange: (v: boolean) => void;
};

export const CountryTableHeader = ({ search, onSearchChange, onlyAllMet, onOnlyAllMetChange }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="flex items-center justify-between">
			<p className="text-sm font-medium">{t('step1.feasibility_title')}</p>

			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Switch checked={onlyAllMet} onCheckedChange={onOnlyAllMetChange} id="filter-all-met" />
					<Label htmlFor="filter-all-met" className="text-sm whitespace-nowrap">
						{t('step1.all_conditions_met')}
					</Label>
				</div>

				<Input
					placeholder={t('common.search')}
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
					className="h-8 w-40"
				/>
			</div>
		</div>
	);
};

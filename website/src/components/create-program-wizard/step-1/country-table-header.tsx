'use client';

import { useRouteTranslator } from '@/lib/i18n/use-route-translator';
import { Label } from '@socialincome/design-system/label/label';
import { SearchInput } from '@socialincome/design-system/search-input/search-input';
import { Switch } from '@socialincome/design-system/switch/switch';

type Props = {
	search: string;
	onSearchChange: (v: string) => void;
	onlyAllMet: boolean;
	onOnlyAllMetChange: (v: boolean) => void;
};

export const CountryTableHeader = ({ search, onSearchChange, onlyAllMet, onOnlyAllMetChange }: Props) => {
	const { t } = useRouteTranslator({ namespace: 'create-program-wizard' });

	return (
		<div className="flex flex-wrap items-center justify-between gap-3">
			<p className="text-sm font-medium">{t('step1.feasibility_title')}</p>

			<div className="flex min-w-0 flex-wrap items-center gap-3">
				<div className="flex items-center gap-2">
					<Switch checked={onlyAllMet} onCheckedChange={onOnlyAllMetChange} id="filter-all-met" />
					<Label htmlFor="filter-all-met">{t('step1.all_conditions_met')}</Label>
				</div>

				<div className="w-48 max-w-full">
					<SearchInput
						aria-label={t('common.search')}
						placeholder={t('common.search')}
						value={search}
						onChange={(e) => onSearchChange(e.target.value)}
					/>
				</div>
			</div>
		</div>
	);
};

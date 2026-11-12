'use client';

import { getCountryNameByCode } from '@/lib/types/country';
import type { CountryEligibilityRow } from '@/modules/countries/country.types';
import { Button } from '@socialincome/design-system/actions/button/button';
import { RadioGroup } from '@socialincome/design-system/forms/radio-group/radio-group';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { meetsAllConditions } from './country-conditions';
import { CountryTableBody } from './country-table-body';
import { CountryTableHeader } from './country-table-header';

const matchesSearch = (row: CountryEligibilityRow, search: string) => {
	if (!search.trim()) {
		return true;
	}

	const q = search.toLowerCase();
	const countryName = getCountryNameByCode(row.country.isoCode)?.toLowerCase() ?? '';

	return row.country.isoCode.toLowerCase().includes(q) || countryName.includes(q);
};

type Props = {
	rows: CountryEligibilityRow[];
	title?: string;
	value?: string | null;
	openIds: string[];
	onValueChange?: (id: string | null) => void;
	onToggleRow: (id: string) => void;
	onOpenIdsChange?: (ids: string[]) => void;
	showSearch?: boolean;
	showFilters?: boolean;
	countryPageHrefs?: Record<string, string>;
};

export const CountryTable = ({
	rows,
	title,
	value,
	openIds,
	onValueChange,
	onToggleRow,
	onOpenIdsChange,
	showSearch = true,
	showFilters = true,
	countryPageHrefs,
}: Props) => {
	const t = useTranslations('create-program-wizard');
	const [search, setSearch] = useState('');
	const [onlyAllMet, setOnlyAllMet] = useState(false);
	const [onlyActive, setOnlyActive] = useState(false);

	if (rows.length === 0) {
		return null;
	}

	let filtered = rows.filter((r) => matchesSearch(r, search));

	if (onlyAllMet) {
		filtered = filtered.filter(meetsAllConditions);
	}

	if (onlyActive) {
		filtered = filtered.filter((row) => row.country.isActive);
	}

	const allOpen = filtered.length > 0 && filtered.every((row) => openIds.includes(row.id));

	const table = (
		<div className="min-w-0 space-y-3">
			<CountryTableHeader
				title={title}
				showSearch={showSearch}
				showFilters={showFilters}
				search={search}
				onSearchChange={setSearch}
				onlyAllMet={onlyAllMet}
				onOnlyAllMetChange={setOnlyAllMet}
				onlyActive={onlyActive}
				onOnlyActiveChange={setOnlyActive}
				aside={
					onOpenIdsChange ? (
						<Button
							variant="outline"
							size="sm"
							aria-label={allOpen ? t('step1.collapse_all') : t('step1.expand_all')}
							onClick={() => onOpenIdsChange(allOpen ? [] : filtered.map((row) => row.id))}
						>
							{allOpen ? <ChevronsDownUp /> : <ChevronsUpDown />}
							{/* Icon only on mobile, so it fits in one row with both toggles */}
							<span className="hidden sm:inline">{allOpen ? t('step1.collapse_all') : t('step1.expand_all')}</span>
						</Button>
					) : undefined
				}
			/>

			{filtered.length === 0 ? (
				<div className="text-muted-foreground py-10 text-center text-sm">{t('step1.no_countries_match')}</div>
			) : (
				<CountryTableBody
					rows={filtered}
					selectable={!!onValueChange}
					value={value}
					openIds={openIds}
					onToggleRow={onToggleRow}
					countryPageHrefs={countryPageHrefs}
				/>
			)}
		</div>
	);

	// Without onValueChange the table only shows eligibility, as on the country eligibility page
	if (!onValueChange) {
		return table;
	}

	return (
		<RadioGroup value={value ?? ''} onValueChange={onValueChange}>
			{table}
		</RadioGroup>
	);
};

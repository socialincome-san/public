'use client';

import { RadioGroup } from '@/components/radio-group';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { getCountryNameByCode } from '@/lib/types/country';
import { useState } from 'react';
import { CountryTableBody } from './country-table-body';
import { CountryTableHeader } from './country-table-header';

const matchesSearch = (row: ProgramCountryFeasibilityRow, search: string) => {
  if (!search.trim()) {
    return true;
  }

  const q = search.toLowerCase();
  const countryName = getCountryNameByCode(row.country.isoCode)?.toLowerCase() ?? '';

  return row.country.isoCode.toLowerCase().includes(q) || countryName.includes(q);
};

const meetsAllConditions = (row: ProgramCountryFeasibilityRow) => {
  return (
    row.cash.condition === 'met' &&
    row.mobileMoney.condition === 'met' &&
    row.mobileNetwork.condition === 'met' &&
    row.sanctions.condition === 'met'
  );
};

type Props = {
  rows: ProgramCountryFeasibilityRow[];
  value?: string | null;
  openIds: string[];
  onValueChange?: (id: string | null) => void;
  onToggleRow: (id: string) => void;
};

export const CountryTable = ({ rows, value, openIds, onValueChange, onToggleRow }: Props) => {
  const [search, setSearch] = useState('');
  const [onlyAllMet, setOnlyAllMet] = useState(false);

  if (rows.length === 0) {
    return null;
  }

  let filtered = rows.filter((r) => matchesSearch(r, search));

  if (onlyAllMet) {
    filtered = filtered.filter(meetsAllConditions);
  }

  return (
    <RadioGroup value={value ?? ''} onValueChange={onValueChange}>
      <div className="space-y-3">
        <CountryTableHeader
          search={search}
          onSearchChange={setSearch}
          onlyAllMet={onlyAllMet}
          onOnlyAllMetChange={setOnlyAllMet}
        />

        {filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">No countries match the current filters</div>
        ) : (
          <CountryTableBody rows={filtered} value={value} openIds={openIds} onToggleRow={onToggleRow} />
        )}
      </div>
    </RadioGroup>
  );
};

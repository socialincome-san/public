'use client';

import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { ActiveCountryCards } from './active-country-cards';
import { CountryTable } from './country-table';

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	selectedCountryId: string | null;
	openRowIds: string[];
	onSelectCountry: (id: string) => void;
	onToggleRow: (id: string) => void;
};

export const CountrySelectionStep = ({ rows, selectedCountryId, openRowIds, onSelectCountry, onToggleRow }: Props) => {
	const active = rows.filter((r) => r.country.isActive);
	const inactive = rows.filter((r) => !r.country.isActive);

	return (
		<div className="space-y-6">
			<ActiveCountryCards rows={active} selectedCountryId={selectedCountryId} onSelectCountry={onSelectCountry} />

			<CountryTable
				rows={inactive}
				value={selectedCountryId}
				openIds={openRowIds}
				onValueChange={(id) => id && onSelectCountry(id)}
				onToggleRow={onToggleRow}
			/>
		</div>
	);
};

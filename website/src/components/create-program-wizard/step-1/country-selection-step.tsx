'use client';

import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { CountryTable } from './country-table';

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	selectedCountryId: string | null;
	openRowIds: string[];
	onSelectCountry: (id: string) => void;
	onToggleRow: (id: string) => void;
};

export function CountrySelectionStep({ rows, selectedCountryId, openRowIds, onSelectCountry, onToggleRow }: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Choose a country</div>

			<CountryTable
				rows={rows}
				value={selectedCountryId}
				openIds={openRowIds}
				onValueChange={(id) => id && onSelectCountry(id)}
				onToggleRow={onToggleRow}
			/>
		</div>
	);
}

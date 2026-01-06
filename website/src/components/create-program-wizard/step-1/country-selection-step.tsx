'use client';

import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { SpinnerIcon } from '@socialincome/ui';
import { CountryTable } from './country-table';

type Props = {
	loading: boolean;
	rows: ProgramCountryFeasibilityRow[];
	selectedCountryId: string | null;
	openRowIds: string[];
	onSelectCountry: (id: string) => void;
	onToggleRow: (id: string) => void;
};

export function CountrySelectionStep({
	loading,
	rows,
	selectedCountryId,
	openRowIds,
	onSelectCountry,
	onToggleRow,
}: Props) {
	return (
		<div className="space-y-4">
			<div className="text-lg font-medium">Choose a country</div>

			{loading ? (
				<div className="text-muted-foreground flex items-center justify-center py-12">
					<SpinnerIcon className="h-5 w-5 animate-spin" />
				</div>
			) : (
				<CountryTable
					rows={rows}
					value={selectedCountryId}
					openIds={openRowIds}
					onValueChange={(id) => id && onSelectCountry(id)}
					onToggleRow={onToggleRow}
				/>
			)}
		</div>
	);
}

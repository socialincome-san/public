'use client';

import { CountryFlag } from '@/components/country-flag';
import type { ProgramCountryFeasibilityRow } from '@/lib/services/country/country.types';
import { getCountryNameByCode } from '@/lib/types/country';
import { RadioCard } from '../radio-card';
import { RadioCardGroup } from '../radio-card-group';

const formatCountryStats = (programCount: number, recipientCount: number) => {
	if (programCount === 0 && recipientCount === 0) {
		return 'No active programs';
	}

	const programLabel = `${programCount} program${programCount !== 1 ? 's' : ''}`;
	const recipientLabel = `${recipientCount} recipient${recipientCount !== 1 ? 's' : ''}`;

	return `${programLabel} · ${recipientLabel}`;
}

type Props = {
	rows: ProgramCountryFeasibilityRow[];
	selectedCountryId: string | null;
	onSelectCountry: (id: string) => void;
};

export const ActiveCountryCards = ({ rows, selectedCountryId, onSelectCountry }: Props) => {
	return (
		<div className="space-y-3">
			<p className="text-sm font-medium">Choose a country</p>

			{rows.length > 0 && (
				<RadioCardGroup value={selectedCountryId ?? ''} onChange={onSelectCountry} layout="grid">
					{rows.map((row) => (
						<RadioCard
							key={row.id}
							value={row.id}
							checked={selectedCountryId === row.id}
							label={
								<div className="flex items-center gap-2">
									<CountryFlag country={row.country.isoCode} size="lg" />
									<span className="font-medium">{getCountryNameByCode(row.country.isoCode)}</span>
								</div>
							}
							description={formatCountryStats(row.stats.programCount, row.stats.recipientCount)}
						/>
					))}
				</RadioCardGroup>
			)}
		</div>
	);
}

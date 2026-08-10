'use client';

import { CountryFlag } from '@/components/country-flag';
import type { CountryCode } from '@/generated/prisma/client';
import { getCountryNameByCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';

export type ProgramCountryFilterOption = {
	countryId: string;
	countryIsoCode: CountryCode;
	programCount: number;
};

type Props = {
	allCountriesLabel: string;
	filterByCountryLabel: string;
	options: readonly ProgramCountryFilterOption[];
	selectedCountryId: string | null;
	onCountryChange: (countryId: string | null) => void;
};

export const ProgramCountryFilter = ({
	allCountriesLabel,
	filterByCountryLabel,
	options,
	selectedCountryId,
	onCountryChange,
}: Props) => {
	if (options.length === 0) {
		return null;
	}

	return (
		<div className="flex flex-wrap gap-2" role="group" aria-label={filterByCountryLabel}>
			<button
				type="button"
				aria-pressed={selectedCountryId === null}
				onClick={() => onCountryChange(null)}
				className={cn(
					'inline-flex items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
					'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
					selectedCountryId === null
						? 'border-foreground/20 bg-background text-foreground shadow-sm'
						: 'border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted/40',
				)}
			>
				{allCountriesLabel}
			</button>
			{options.map(({ countryId, countryIsoCode, programCount }) => {
				const isSelected = selectedCountryId === countryId;
				const countryName = getCountryNameByCode(countryIsoCode);

				return (
					<button
						key={countryId}
						type="button"
						aria-pressed={isSelected}
						onClick={() => onCountryChange(countryId)}
						className={cn(
							'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
							'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
							isSelected
								? 'border-foreground/20 bg-background text-foreground shadow-sm'
								: 'border-border bg-background text-foreground hover:bg-muted/40',
						)}
					>
						<CountryFlag country={countryIsoCode} size="sm" />
						<span>
							{countryName} ({programCount})
						</span>
					</button>
				);
			})}
		</div>
	);
};

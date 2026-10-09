'use client';

import { CountryFlag } from '@/components/country-flag';
import { CountryCode } from '@/generated/prisma/enums';

type CountryFlagCellProps = {
	country?: CountryCode | null;
	fallbackCountry?: CountryCode | null;
	placeholder?: string;
};

export const CountryFlagCell = ({ country, fallbackCountry, placeholder = '-' }: CountryFlagCellProps) => {
	const resolvedCountry = country ?? fallbackCountry;

	if (!resolvedCountry) {
		return <span className="text-muted-foreground">{placeholder}</span>;
	}

	return <CountryFlag country={resolvedCountry} />;
};

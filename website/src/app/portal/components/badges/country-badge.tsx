'use client';

import { Badge } from '@/app/portal/components/badge';
import { FlagSierraLeone } from '@/app/portal/components/badges/flags/flag-sierra-leone';
import * as React from 'react';

export type CountryKey = 'sierra_leone';

const COUNTRY_UI: Record<CountryKey, { label: string; flag: React.ReactNode }> = {
	sierra_leone: { label: 'Sierra Leone', flag: <FlagSierraLeone /> },
};

export function CountryBadge({ country }: { country: CountryKey }) {
	const { label, flag } = COUNTRY_UI[country];
	return (
		<Badge variant="country">
			<span className="mr-1">{flag}</span>
			{label}
		</Badge>
	);
}

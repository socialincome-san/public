'use client';

import { CountryTable } from '@/components/create-program-wizard/step-1/country-table';
import type { CountryEligibilityRow } from '@/modules/countries/country.types';
import { useState } from 'react';
import type { CountryPageHrefs } from './country-page-hrefs';

type Props = {
	rows: CountryEligibilityRow[];
	showSearch?: boolean;
	showFilters?: boolean;
	showExpandAll?: boolean;
	countryPageHrefs?: CountryPageHrefs;
};

export const CountryEligibilityTable = ({
	rows,
	showSearch,
	showFilters,
	showExpandAll = true,
	countryPageHrefs,
}: Props) => {
	const [openIds, setOpenIds] = useState<string[]>([]);

	const toggleRow = (id: string) =>
		setOpenIds((current) => (current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id]));

	return (
		<CountryTable
			rows={rows}
			openIds={openIds}
			onToggleRow={toggleRow}
			onOpenIdsChange={showExpandAll ? setOpenIds : undefined}
			showSearch={showSearch}
			showFilters={showFilters}
			countryPageHrefs={countryPageHrefs}
		/>
	);
};

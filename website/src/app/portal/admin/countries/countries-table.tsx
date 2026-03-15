'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { countriesTableConfig } from '@/components/data-table/configs/countries-table.config';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { CountryDialog } from './country-dialog';

export default function CountriesTable({
	rows,
	error,
	query,
}: {
	rows: CountryTableViewRow[];
	error: string | null;
	query?: TableQueryState & { totalRows: number };
}) {
	const [open, setOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [countryId, setCountryId] = useState<string | undefined>(undefined);

	const openEmptyForm = () => {
		setCountryId(undefined);
		setErrorMessage(null);
		setOpen(true);
	};

	const openEditForm = (row: CountryTableViewRow) => {
		setCountryId(row.id);
		setErrorMessage(null);
		setOpen(true);
	};

	return (
		<>
			<ConfiguredDataTableClient
				config={countriesTableConfig}
				titleInfoTooltip="Shows countries and their operational readiness signals in admin scope."
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: 'Add country',
						icon: <PlusIcon />,
						onSelect: openEmptyForm,
					},
				]}
				onRowClick={openEditForm}
			/>

			<CountryDialog
				open={open}
				onOpenChange={setOpen}
				countryId={countryId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}

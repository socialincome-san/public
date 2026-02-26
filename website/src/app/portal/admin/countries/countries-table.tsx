'use client';

import { Button } from '@/components/button';
import { makeCountryColumns } from '@/components/data-table/columns/countries';
import DataTable from '@/components/data-table/data-table';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { useState } from 'react';
import { CountryDialog } from './country-dialog';

export default function CountriesTable({ rows, error }: { rows: CountryTableViewRow[]; error: string | null }) {
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
			<DataTable
				title="Countries"
				error={error}
				emptyMessage="No countries found"
				data={rows}
				makeColumns={makeCountryColumns}
				actions={<Button onClick={openEmptyForm}>Add country</Button>}
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

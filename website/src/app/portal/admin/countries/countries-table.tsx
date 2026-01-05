'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/alert';
import { Button } from '@/components/button';
import { makeCountryColumns } from '@/components/data-table/columns/countries';
import DataTable from '@/components/data-table/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/dialog';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';
import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import CountriesForm from './countries-form';

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

	const onError = (error: unknown) => {
		setErrorMessage(`Error saving country: ${error}`);
		logger.error('Country Form Error', { error });
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

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>{countryId ? 'Edit' : 'Add'} country</DialogTitle>
					</DialogHeader>
					{errorMessage && (
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{errorMessage}</AlertDescription>
						</Alert>
					)}
					<CountriesForm
						countryId={countryId}
						onSuccess={() => setOpen(false)}
						onCancel={() => setOpen(false)}
						onError={onError}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
}

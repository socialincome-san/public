'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { countriesTableConfig } from '@/components/data-table/configs/countries-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CountryTableViewRow } from '@/modules/countries/country.types';
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
	const { recordId: countryId, open, openCreate, openRecord, onOpenChange } = useRecordDialog('countryId');
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const openEmptyForm = () => {
		setErrorMessage(null);
		openCreate();
	};

	const openEditForm = (row: CountryTableViewRow) => {
		setErrorMessage(null);
		openRecord(row.id);
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
				onOpenChange={onOpenChange}
				countryId={countryId}
				errorMessage={errorMessage}
				onError={setErrorMessage}
			/>
		</>
	);
}

'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { countriesTableConfig } from '@/components/data-table/configs/countries-table.config';
import { useSearchParamState } from '@/components/data-table/hooks/use-search-param-state';
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
	const [countryId, setCountryId] = useSearchParamState('countryId');
	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const open = isCreateFormOpen || Boolean(countryId);

	const openEmptyForm = () => {
		setCountryId(undefined);
		setErrorMessage(null);
		setIsCreateFormOpen(true);
	};

	const openEditForm = (row: CountryTableViewRow) => {
		setCountryId(row.id);
		setErrorMessage(null);
	};

	const onOpenChange = (nextOpen: boolean) => {
		if (!nextOpen) {
			setCountryId(undefined);
			setIsCreateFormOpen(false);
		}
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

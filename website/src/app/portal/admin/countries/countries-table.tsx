'use client';

import { ConfiguredDataTableClient } from '@/components/data-table/clients/configured-data-table-client';
import { countriesTableConfig } from '@/components/data-table/configs/countries-table.config';
import { useRecordDialog } from '@/components/data-table/hooks/use-record-dialog';
import type { TableQueryState } from '@/components/data-table/query-state';
import type { CountryTableViewRow } from '@/modules/countries/country.types';
import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
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
	const t = useTranslations('portal-admin');
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
				config={{
					...countriesTableConfig,
					title: t('table.countries'),
					emptyMessage: t('table.noCountries'),
				}}
				titleInfoTooltip={t('table.countriesTooltip')}
				rows={rows}
				error={error}
				query={query}
				actionMenuItems={[
					{
						label: t('actions.addCountry'),
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

import { makeCountryColumns } from '@/components/data-table/columns/countries';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { CountryTableViewRow } from '@/lib/services/country/country.types';

export const countriesTableConfig: DataTableConfig<CountryTableViewRow> = {
	id: 'admin-countries',
	title: 'Countries',
	emptyMessage: 'No countries found',
	searchKeys: ['isoCode', 'networkTechnology'],
	sortOptions: [
		{ id: 'isoCode', label: 'Country' },
		{ id: 'isActive', label: 'Active' },
		{ id: 'microfinanceIndex', label: 'Microfinance index' },
		{ id: 'populationCoverage', label: 'Population coverage' },
		{ id: 'networkTechnology', label: 'Network technology' },
		{ id: 'latestSurveyDate', label: 'Latest survey' },
		{ id: 'updatedAt', label: 'Updated' },
	],
	makeColumns: makeCountryColumns,
	showColumnVisibilitySelector: true,
};

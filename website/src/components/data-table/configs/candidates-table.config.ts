import { makeCandidateColumns } from '@/components/data-table/columns/candidates';
import { TableQueryState } from '@/components/data-table/query-state';
import type { DataTableConfig, TableFilterConfig } from '@/components/data-table/table-config.types';
import type { CandidatesTableViewRow } from '@/lib/services/candidate/candidate.types';

type CandidatesFilterArgs = {
	query?: TableQueryState & { totalRows: number };
	filterOptions: {
		countries: { value: string; label: string }[];
		genders: { value: string; label: string }[];
		localPartners: { value: string; label: string }[];
	};
	showLocalPartnerFilter?: boolean;
	showGenderFilter?: boolean;
};

export const candidatesTableConfig: DataTableConfig<CandidatesTableViewRow> = {
	id: 'candidates',
	title: 'Candidate Pool',
	emptyMessage: 'No candidates found',
	searchKeys: ['firstName', 'lastName', 'localPartnerName'],
	sortOptions: [
		{ id: 'candidate', label: 'Candidate' },
		{ id: 'country', label: 'Country' },
		{ id: 'gender', label: 'Gender' },
		{ id: 'dateOfBirth', label: 'Age' },
		{ id: 'contactNumber', label: 'Contact number' },
		{ id: 'localPartnerName', label: 'Local partner' },
	],
	makeColumns: makeCandidateColumns,
	showColumnVisibilitySelector: true,
};

export const getCandidatesTableFilters = ({
	query,
	filterOptions,
	showLocalPartnerFilter = true,
	showGenderFilter = false,
}: CandidatesFilterArgs): TableFilterConfig[] => {
	if (!query) {
		return [];
	}

	const filters: TableFilterConfig[] = [
		{
			id: 'country',
			queryKey: 'country',
			label: 'Country',
			placeholder: 'All countries',
			value: query.country,
			options: filterOptions.countries,
		},
		{
			id: 'localPartner',
			queryKey: 'localPartnerId',
			label: 'Local partner',
			placeholder: 'All local partners',
			value: query.localPartnerId,
			options: filterOptions.localPartners,
			hidden: !showLocalPartnerFilter,
		},
		{
			id: 'gender',
			queryKey: 'gender',
			label: 'Gender',
			placeholder: 'All genders',
			value: query.gender,
			options: filterOptions.genders,
			hidden: !showGenderFilter,
		},
	];

	return filters.filter((filter) => !filter.hidden);
};

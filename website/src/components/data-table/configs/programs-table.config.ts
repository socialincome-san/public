import { makeProgramColumns } from '@/components/data-table/columns/programs';
import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { ProgramTableViewRow } from '@/modules/programs/program.types';

const programsTableConfig: DataTableConfig<ProgramTableViewRow> = {
	id: 'programs',
	title: 'Programs',
	emptyMessage: 'No programs found',
	searchKeys: ['id', 'name', 'ownerOrganizations', 'operatorOrganizations', 'focuses'],
	sortOptions: [
		{ id: 'name', label: 'Name' },
		{ id: 'country', label: 'Country' },
		{ id: 'recipientsCount', label: 'Recipients' },
		{ id: 'createdAt', label: 'Created' },
	],
	makeColumns: () => makeProgramColumns(),
	showColumnVisibilitySelector: true,
};

export const organizationOwnedProgramsTableConfig: DataTableConfig<ProgramTableViewRow> = {
	...programsTableConfig,
	id: 'organization-owned-programs',
	title: 'Owned programs',
	searchKeys: programsTableConfig.searchKeys.filter((key) => key !== 'ownerOrganizations'),
	makeColumns: () => makeProgramColumns({ hideOwners: true }),
};

export const organizationOperatedProgramsTableConfig: DataTableConfig<ProgramTableViewRow> = {
	...programsTableConfig,
	id: 'organization-operated-programs',
	title: 'Operated programs',
	searchKeys: programsTableConfig.searchKeys.filter((key) => key !== 'operatorOrganizations'),
	makeColumns: () => makeProgramColumns({ hideOperators: true }),
};

export const countryProgramsTableConfig: DataTableConfig<ProgramTableViewRow> = {
	...programsTableConfig,
	id: 'country-programs',
	searchKeys: programsTableConfig.searchKeys,
	sortOptions: programsTableConfig.sortOptions?.filter(({ id }) => id !== 'country'),
	makeColumns: () => makeProgramColumns({ hideCountry: true }),
};

export const focusProgramsTableConfig: DataTableConfig<ProgramTableViewRow> = {
	...programsTableConfig,
	id: 'focus-programs',
	searchKeys: programsTableConfig.searchKeys.filter((key) => key !== 'focuses'),
	makeColumns: () => makeProgramColumns({ hideFocuses: true }),
};

'use client';

import { Button } from '@/components/button';
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/dropdown-menu';
import { Input } from '@/components/input';
import type { VolunteerDurationTranslations } from '@/components/storyblok/shared/person-card';
import { PersonCardGrid } from '@/components/storyblok/shared/person-card-grid';
import type { Person } from '@/generated/storyblok/types/109655/storyblok-components';
import type { WebsiteLanguage, WebsiteRegion } from '@/lib/i18n/utils';
import { getRoleCode, getRoleLabel, personHasRole } from '@/lib/services/storyblok/storyblok.utils';
import { getCountryNameFromIsoCode } from '@/lib/types/country';
import { cn } from '@/lib/utils/cn';
import type { ISbStoryData } from '@storyblok/js';
import { ArrowUpDownIcon, ChevronDown, SearchIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

type SortOption = 'random' | 'alphabetical' | 'startDate';
type PersonStatus = 'active' | 'inactive';

type PersonGridTranslations = {
	searchPlaceholder: string;
	sortAriaLabel: string;
	sortRandom: string;
	sortAlphabetical: string;
	sortStartDate: string;
	filterAllRoles: string;
	filterAllStatuses: string;
	filterAllCountries: string;
	filterMultipleSelected: string;
	filterSelectAll: string;
	filterClearAll: string;
	statusActive: string;
	statusInactive: string;
	noResults: string;
};

type Props = {
	persons: ISbStoryData<Person>[];
	lang: WebsiteLanguage;
	region: WebsiteRegion;
	centerLastRow: boolean;
	smallCards: boolean;
	linkToPersonPage: boolean;
	volunteerDurationTranslations?: VolunteerDurationTranslations;
	roleLabels?: Record<string, string>;
	showSearch: boolean;
	showSort: boolean;
	showFilterPills: boolean;
	defaultStatus: string;
	limit: number;
	translations: PersonGridTranslations;
};

const STATUS_LABEL_KEYS: Record<PersonStatus, keyof PersonGridTranslations> = {
	active: 'statusActive',
	inactive: 'statusInactive',
};

const FILTER_TRIGGER_CLASSNAME =
	'text-foreground border-border bg-card hover:bg-card h-10 min-w-0 max-w-40 shrink px-4 text-sm font-medium';

// Alphabetical sorting goes by first name, falling back to the full name when it's unset.
const getSortableName = (person: ISbStoryData<Person>) => person.content.firstName || person.content.fullName;

const getPersonCountryCode = (person: ISbStoryData<Person>) => {
	const { country } = person.content;

	return typeof country === 'string' || typeof country === 'number' ? String(country) : '';
};

const matchesRole = (person: ISbStoryData<Person>, selectedRoles: string[]) =>
	selectedRoles.length === 0 || personHasRole(person, selectedRoles);

const matchesStatus = (person: ISbStoryData<Person>, selectedStatuses: PersonStatus[]) =>
	selectedStatuses.length === 0 || selectedStatuses.includes(person.content.volunteerStatus as PersonStatus);

const matchesCountry = (person: ISbStoryData<Person>, selectedCountries: string[]) =>
	selectedCountries.length === 0 || selectedCountries.includes(getPersonCountryCode(person));

const hashToUnitInterval = (value: string) => {
	let hash = 0;
	for (let index = 0; index < value.length; index += 1) {
		hash = (hash << 5) - hash + value.charCodeAt(index);
		hash |= 0;
	}

	return (hash >>> 0) / 4294967295;
};

type FilterDropdownProps<T extends string> = {
	triggerLabel: string;
	items: T[];
	selected: T[];
	onToggle: (value: T) => void;
	onSelectAll: () => void;
	onClearAll: () => void;
	getLabel: (value: T) => string;
	selectAllLabel: string;
	clearAllLabel: string;
};

const FilterDropdown = <T extends string>({
	triggerLabel,
	items,
	selected,
	onToggle,
	onSelectAll,
	onClearAll,
	getLabel,
	selectAllLabel,
	clearAllLabel,
}: FilterDropdownProps<T>) => {
	// Selecting everything is equivalent to no filter, so it isn't highlighted as active.
	const isActive = selected.length > 0 && selected.length !== items.length;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					className={cn(FILTER_TRIGGER_CLASSNAME, isActive && 'bg-input hover:bg-input')}
				>
					<span className="min-w-0 truncate">{triggerLabel}</span>
					<ChevronDown className="text-foreground size-4 shrink-0 opacity-70" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className="w-56">
				<DropdownMenuItem
					onSelect={(event) => {
						event.preventDefault();

						if (selected.length === 0) {
							onSelectAll();
						} else {
							onClearAll();
						}
					}}
				>
					{selected.length === 0 ? selectAllLabel : clearAllLabel}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				{items.map((item) => (
					<DropdownMenuCheckboxItem
						key={item}
						checked={selected.includes(item)}
						onCheckedChange={() => onToggle(item)}
						onSelect={(event) => event.preventDefault()}
					>
						{getLabel(item)}
					</DropdownMenuCheckboxItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
};

export const PersonGridInteractive = ({
	persons,
	lang,
	region,
	centerLastRow,
	smallCards,
	linkToPersonPage,
	volunteerDurationTranslations,
	roleLabels,
	showSearch,
	showSort,
	showFilterPills,
	defaultStatus,
	limit,
	translations,
}: Props) => {
	const [searchTerm, setSearchTerm] = useState('');
	const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
	const [shuffleSeed, setShuffleSeed] = useState(0);
	const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
	const [selectedStatuses, setSelectedStatuses] = useState<PersonStatus[]>(
		defaultStatus === 'active' || defaultStatus === 'inactive' ? [defaultStatus] : [],
	);
	const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

	const roleLabelFor = useCallback((role: string) => getRoleLabel(role, roleLabels), [roleLabels]);

	// Each dimension's available options are scoped to persons matching the OTHER dimensions' current
	// selections (faceted filtering) — otherwise a grid pre-scoped to e.g. inactive volunteers would
	// still surface roles/countries that only exist among active volunteers hidden in the same fetch.
	const roles = useMemo(() => {
		const relevant = persons.filter(
			(person) => matchesStatus(person, selectedStatuses) && matchesCountry(person, selectedCountries),
		);
		const values = relevant.map((person) => getRoleCode(person.content.primaryRole)).filter(Boolean);

		return Array.from(new Set(values)).sort((a, b) => roleLabelFor(a).localeCompare(roleLabelFor(b)));
	}, [persons, selectedStatuses, selectedCountries, roleLabelFor]);

	const statuses = useMemo(() => {
		const relevant = persons.filter(
			(person) => matchesRole(person, selectedRoles) && matchesCountry(person, selectedCountries),
		);
		const values = relevant
			.map((person) => person.content.volunteerStatus)
			.filter((status): status is PersonStatus => status === 'active' || status === 'inactive');

		return Array.from(new Set(values));
	}, [persons, selectedRoles, selectedCountries]);

	const countries = useMemo(() => {
		const relevant = persons.filter(
			(person) => matchesRole(person, selectedRoles) && matchesStatus(person, selectedStatuses),
		);
		const codes = Array.from(new Set(relevant.map(getPersonCountryCode).filter(Boolean)));

		return codes
			.map((code) => ({ code, label: getCountryNameFromIsoCode(code) }))
			.sort((a, b) => a.label.localeCompare(b.label))
			.map((entry) => entry.code);
	}, [persons, selectedRoles, selectedStatuses]);

	const toggleRole = (role: string) => {
		setSelectedRoles((current) => (current.includes(role) ? current.filter((value) => value !== role) : [...current, role]));
	};

	const toggleStatus = (status: PersonStatus) => {
		setSelectedStatuses((current) =>
			current.includes(status) ? current.filter((value) => value !== status) : [...current, status],
		);
	};

	const toggleCountry = (country: string) => {
		setSelectedCountries((current) =>
			current.includes(country) ? current.filter((value) => value !== country) : [...current, country],
		);
	};

	const randomOrder = useMemo(() => {
		const order = new Map<string, number>();
		persons.forEach((person) => order.set(person.uuid, hashToUnitInterval(`${shuffleSeed}:${person.uuid}`)));

		return order;
	}, [persons, shuffleSeed]);

	const startTimes = useMemo(
		() =>
			new Map(
				persons.map((person) => [
					person.uuid,
					person.content.volunteerSince ? new Date(person.content.volunteerSince).getTime() : Infinity,
				]),
			),
		[persons],
	);

	const reshuffle = () => {
		setSortBy('random');
		setShuffleSeed((seed) => seed + 1);
	};

	const filteredPersons = useMemo(() => {
		const search = searchTerm.trim().toLowerCase();

		const filtered = persons.filter((person) => {
			const matchesSearch = !search || person.content.fullName.toLowerCase().includes(search);

			return (
				matchesSearch &&
				matchesRole(person, selectedRoles) &&
				matchesStatus(person, selectedStatuses) &&
				matchesCountry(person, selectedCountries)
			);
		});

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'random') {
				return (randomOrder.get(a.uuid) ?? 0) - (randomOrder.get(b.uuid) ?? 0);
			}

			if (sortBy === 'startDate') {
				return (startTimes.get(a.uuid) ?? Infinity) - (startTimes.get(b.uuid) ?? Infinity);
			}

			return getSortableName(a).localeCompare(getSortableName(b));
		});

		return limit > 0 ? sorted.slice(0, limit) : sorted;
	}, [persons, searchTerm, selectedRoles, selectedStatuses, selectedCountries, sortBy, limit, randomOrder, startTimes]);

	// "All X (n)" when nothing (or everything) is selected, the item's own label for a single
	// selection, and "n selected" for a partial multi-selection.
	const filterTriggerLabel = <T extends string>(
		selected: T[],
		all: T[],
		allLabel: string,
		getLabel: (value: T) => string,
	) =>
		selected.length === 0 || selected.length === all.length
			? allLabel.replace('{{count}}', String(all.length))
			: selected.length === 1
				? getLabel(selected[0])
				: translations.filterMultipleSelected.replace('{{count}}', String(selected.length));

	const roleLabel = filterTriggerLabel(selectedRoles, roles, translations.filterAllRoles, roleLabelFor);
	const statusLabel = filterTriggerLabel(
		selectedStatuses,
		statuses,
		translations.filterAllStatuses,
		(status) => translations[STATUS_LABEL_KEYS[status]],
	);
	const countryLabel = filterTriggerLabel(
		selectedCountries,
		countries,
		translations.filterAllCountries,
		getCountryNameFromIsoCode,
	);

	// When the block is locked to a single status (statusFilter !== 'all'), there's nothing to
	// toggle — the status dropdown only makes sense when visitors can actually narrow between them.
	const showStatusFilter = statuses.length > 0 && defaultStatus === 'all';

	const hasToolbar = showFilterPills || showSort || showSearch;
	const hasFilters = showFilterPills && (roles.length > 0 || showStatusFilter || countries.length > 0);

	const sortDropdown = showSort ? (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					type="button"
					variant="outline"
					size="icon"
					className="h-10 w-10 shrink-0"
					aria-label={translations.sortAriaLabel}
				>
					<ArrowUpDownIcon className="size-4" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onSelect={() => setSortBy('alphabetical')}>{translations.sortAlphabetical}</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => setSortBy('startDate')}>{translations.sortStartDate}</DropdownMenuItem>
				<DropdownMenuItem onSelect={reshuffle}>{translations.sortRandom}</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	) : null;

	return (
		<div className="space-y-6">
			{hasToolbar ? (
				<div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-center justify-between gap-2">
						<div className="flex flex-nowrap items-center gap-2">
							{showFilterPills && roles.length > 0 ? (
								<FilterDropdown
									triggerLabel={roleLabel}
									items={roles}
									selected={selectedRoles}
									onToggle={toggleRole}
									onSelectAll={() => setSelectedRoles(roles)}
									onClearAll={() => setSelectedRoles([])}
									getLabel={roleLabelFor}
									selectAllLabel={translations.filterSelectAll}
									clearAllLabel={translations.filterClearAll}
								/>
							) : null}
							{showFilterPills && showStatusFilter ? (
								<FilterDropdown
									triggerLabel={statusLabel}
									items={statuses}
									selected={selectedStatuses}
									onToggle={toggleStatus}
									onSelectAll={() => setSelectedStatuses(statuses)}
									onClearAll={() => setSelectedStatuses([])}
									getLabel={(status) => translations[STATUS_LABEL_KEYS[status]]}
									selectAllLabel={translations.filterSelectAll}
									clearAllLabel={translations.filterClearAll}
								/>
							) : null}
							{showFilterPills && countries.length > 0 ? (
								<FilterDropdown
									triggerLabel={countryLabel}
									items={countries}
									selected={selectedCountries}
									onToggle={toggleCountry}
									onSelectAll={() => setSelectedCountries(countries)}
									onClearAll={() => setSelectedCountries([])}
									getLabel={getCountryNameFromIsoCode}
									selectAllLabel={translations.filterSelectAll}
									clearAllLabel={translations.filterClearAll}
								/>
							) : null}
						</div>
						{/* Below lg, sort sits right-aligned alongside the filters; at lg and up it moves next to search. */}
						{hasFilters ? <div className="lg:hidden">{sortDropdown}</div> : null}
					</div>

					<div className="flex flex-nowrap items-center gap-2">
						{hasFilters ? <div className="hidden lg:block">{sortDropdown}</div> : sortDropdown}
						{showSearch ? (
							<div className="relative w-full lg:w-64 lg:shrink-0">
								<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
								<Input
									type="search"
									aria-label={translations.searchPlaceholder}
									placeholder={translations.searchPlaceholder}
									value={searchTerm}
									onChange={(event) => setSearchTerm(event.target.value)}
									className="bg-card h-10 pl-9"
								/>
							</div>
						) : null}
					</div>
				</div>
			) : null}

			{filteredPersons.length === 0 ? (
				<p className="text-muted-foreground">{translations.noResults}</p>
			) : (
				<PersonCardGrid
					persons={filteredPersons}
					lang={lang}
					region={region}
					centerLastRow={centerLastRow}
					smallCards={smallCards}
					linkToPersonPage={linkToPersonPage}
					volunteerDurationTranslations={volunteerDurationTranslations}
					roleLabels={roleLabels}
				/>
			)}
		</div>
	);
};

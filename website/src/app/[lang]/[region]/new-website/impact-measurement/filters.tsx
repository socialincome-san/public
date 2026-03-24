'use client';

import { MultiSelect, type MultiSelectOption } from '@/components/multi-select';
import { Funnel } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FILTER_PREFIX, IMPACT_FILTER_QUERY_KEYS } from './filters.constants';

type ImpactMeasurementFiltersProps = {
	allFiltersPlaceholder: string;
	filterGroups: { heading: string; options: MultiSelectOption[] }[];
	selectedFilters: string[];
};

export const ImpactMeasurementFilters = ({
	allFiltersPlaceholder,
	filterGroups,
	selectedFilters,
}: ImpactMeasurementFiltersProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const updateMultiFilter = (values: string[]) => {
		const nextParams = new URLSearchParams(searchParams.toString());
		const countries = values
			.filter((value) => value.startsWith(FILTER_PREFIX.country))
			.map((value) => value.replace(FILTER_PREFIX.country, ''));
		const programs = values
			.filter((value) => value.startsWith(FILTER_PREFIX.program))
			.map((value) => value.replace(FILTER_PREFIX.program, ''));
		const questionnaires = values
			.filter((value) => value.startsWith(FILTER_PREFIX.questionnaire))
			.map((value) => value.replace(FILTER_PREFIX.questionnaire, ''));
		const recipientFilters = values
			.filter((value) => value.startsWith(FILTER_PREFIX.recipient))
			.map((value) => value.replace(FILTER_PREFIX.recipient, ''));

		if (countries.length > 0) {
			nextParams.set(IMPACT_FILTER_QUERY_KEYS.country, countries.join(','));
		} else {
			nextParams.delete(IMPACT_FILTER_QUERY_KEYS.country);
		}
		if (programs.length > 0) {
			nextParams.set(IMPACT_FILTER_QUERY_KEYS.program, programs.join(','));
		} else {
			nextParams.delete(IMPACT_FILTER_QUERY_KEYS.program);
		}
		if (questionnaires.length > 0) {
			nextParams.set(IMPACT_FILTER_QUERY_KEYS.questionnaire, questionnaires.join(','));
		} else {
			nextParams.delete(IMPACT_FILTER_QUERY_KEYS.questionnaire);
		}
		if (recipientFilters.length > 0) {
			nextParams.set(IMPACT_FILTER_QUERY_KEYS.recipientFilters, recipientFilters.join(','));
		} else {
			nextParams.delete(IMPACT_FILTER_QUERY_KEYS.recipientFilters);
		}

		const nextQuery = nextParams.toString();
		router.push(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname);
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			<MultiSelect
				options={filterGroups}
				defaultValue={selectedFilters}
				onValueChange={updateMultiFilter}
				placeholder={allFiltersPlaceholder}
				placeholderIcon={Funnel}
				placeholderClassName="text-cyan-950"
				hideSelectAll
				searchable={false}
				maxCount={3}
				className="h-10 min-w-52 border-slate-200 bg-white px-2 text-sm font-medium text-cyan-950 sm:min-w-72"
				popoverClassName="max-w-sm"
				popoverAlign="end"
			/>
		</div>
	);
};

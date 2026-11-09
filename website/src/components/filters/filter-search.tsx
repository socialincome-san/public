'use client';

import { SearchInput } from '@socialincome/design-system/forms/search-input/search-input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { applyQueryParamOverrides, type FilterQueryParamOverride } from './filter-query';

type FilterSearchProps = {
	queryKey: string;
	label: string;
	placeholder: string;
	compactPlaceholder?: string;
	queryParamOverrides?: FilterQueryParamOverride[];
};

const SEARCH_DEBOUNCE_MS = 300;

export const FilterSearch = ({
	queryKey,
	label,
	placeholder,
	compactPlaceholder,
	queryParamOverrides,
}: FilterSearchProps) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (searchDebounceRef.current) {
				clearTimeout(searchDebounceRef.current);
			}
		};
	}, []);

	const updateSearch = (nextValue: string) => {
		if (searchDebounceRef.current) {
			clearTimeout(searchDebounceRef.current);
		}

		searchDebounceRef.current = setTimeout(() => {
			// Read the URL when the timer fires, not when typing started: a filter picked in the meantime must survive
			const nextParams = new URLSearchParams(window.location.search);
			const searchQuery = nextValue.trim();

			if (searchQuery.length > 0) {
				nextParams.set(queryKey, searchQuery);
			} else {
				nextParams.delete(queryKey);
			}

			applyQueryParamOverrides(nextParams, queryParamOverrides);

			const nextQuery = nextParams.toString();
			router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		}, SEARCH_DEBOUNCE_MS);
	};

	return (
		<SearchInput
			aria-label={label}
			placeholder={placeholder}
			compactPlaceholder={compactPlaceholder}
			defaultValue={searchParams.get(queryKey) ?? ''}
			onChange={(event) => updateSearch(event.target.value)}
		/>
	);
};

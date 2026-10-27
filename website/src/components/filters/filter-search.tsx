'use client';

import { SearchInput } from '@socialincome/design-system/forms/search-input/search-input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

type FilterSearchProps = {
	queryKey: string;
	label: string;
	placeholder: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export const FilterSearch = ({ queryKey, label, placeholder }: FilterSearchProps) => {
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
			const nextParams = new URLSearchParams(searchParams.toString());
			const searchQuery = nextValue.trim();

			if (searchQuery.length > 0) {
				nextParams.set(queryKey, searchQuery);
			} else {
				nextParams.delete(queryKey);
			}

			const nextQuery = nextParams.toString();
			router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		}, SEARCH_DEBOUNCE_MS);
	};

	return (
		<SearchInput
			aria-label={label}
			placeholder={placeholder}
			defaultValue={searchParams.get(queryKey) ?? ''}
			onChange={(event) => updateSearch(event.target.value)}
		/>
	);
};

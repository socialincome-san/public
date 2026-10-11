'use client';

import { SearchInput } from '@socialincome/design-system/forms/search-input/search-input';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { SEARCH_QUERY_KEY } from './local-partners-overview-query';

type Props = {
	defaultValue: string;
	label: string;
	placeholder: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export const LocalPartnersOverviewSearch = ({ defaultValue, label, placeholder }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentValue = searchParams.get(SEARCH_QUERY_KEY) ?? defaultValue;
	const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const searchParamsRef = useRef(searchParams);

	useEffect(() => {
		searchParamsRef.current = searchParams;
	}, [searchParams]);

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
			const nextParams = new URLSearchParams(searchParamsRef.current.toString());
			const searchQuery = nextValue.trim();

			if (searchQuery.length > 0) {
				nextParams.set(SEARCH_QUERY_KEY, searchQuery);
			} else {
				nextParams.delete(SEARCH_QUERY_KEY);
			}

			const nextQuery = nextParams.toString();
			router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		}, SEARCH_DEBOUNCE_MS);
	};

	return (
		<SearchInput
			aria-label={label}
			placeholder={placeholder}
			defaultValue={currentValue}
			onChange={(event) => updateSearch(event.target.value)}
		/>
	);
};

'use client';

import { Input } from '@/components/input';
import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { SEARCH_QUERY_KEY } from './focuses-overview-query';

type Props = {
	defaultValue: string;
	label: string;
	placeholder: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export const FocusesOverviewSearch = ({ defaultValue, label, placeholder }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentValue = searchParams.get(SEARCH_QUERY_KEY) ?? defaultValue;
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
				nextParams.set(SEARCH_QUERY_KEY, searchQuery);
			} else {
				nextParams.delete(SEARCH_QUERY_KEY);
			}

			const nextQuery = nextParams.toString();
			router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
		}, SEARCH_DEBOUNCE_MS);
	};

	return (
		<div className="relative w-full sm:w-80">
			<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
			<Input
				type="search"
				aria-label={label}
				placeholder={placeholder}
				defaultValue={currentValue}
				onChange={(event) => updateSearch(event.target.value)}
				className="bg-card pl-9"
			/>
		</div>
	);
};

'use client';

import { Input } from '@/components/input';
import { SearchIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Props = {
	defaultValue: string;
	label: string;
	placeholder: string;
};

const SEARCH_QUERY_KEY = 'search';

export const ProgramsOverviewSearch = ({ defaultValue, label, placeholder }: Props) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const currentValue = searchParams.get(SEARCH_QUERY_KEY) ?? defaultValue;
	const [value, setValue] = useState(currentValue);

	useEffect(() => {
		setValue(currentValue);
	}, [currentValue]);

	const updateSearch = (nextValue: string) => {
		setValue(nextValue);
		const nextParams = new URLSearchParams(searchParams.toString());
		const searchQuery = nextValue.trim();

		if (searchQuery.length > 0) {
			nextParams.set(SEARCH_QUERY_KEY, searchQuery);
		} else {
			nextParams.delete(SEARCH_QUERY_KEY);
		}

		const nextQuery = nextParams.toString();
		router.replace(nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
	};

	return (
		<div className="relative w-full sm:w-80">
			<SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
			<Input
				type="search"
				aria-label={label}
				placeholder={placeholder}
				value={value}
				onChange={(event) => updateSearch(event.target.value)}
				className="bg-white pl-9"
			/>
		</div>
	);
};

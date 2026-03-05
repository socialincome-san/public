'use client';

import { applyTableQueryPatch, TableQueryState } from '@/components/data-table/query-state';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRef, useTransition } from 'react';

type UpdateOptions = {
	debounceMs?: number;
};

export const useTableQueryNavigation = () => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const updateQuery = (patch: Partial<TableQueryState>, options?: UpdateOptions) => {
		const execute = () => {
			const nextSearchParams = applyTableQueryPatch(new URLSearchParams(searchParams.toString()), patch);
			const query = nextSearchParams.toString();
			startTransition(() => {
				router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
			});
		};

		if (debounceTimeoutRef.current) {
			clearTimeout(debounceTimeoutRef.current);
			debounceTimeoutRef.current = null;
		}

		if (options?.debounceMs && options.debounceMs > 0) {
			debounceTimeoutRef.current = setTimeout(execute, options.debounceMs);
			return;
		}

		execute();
	};

	return {
		isPending,
		updateQuery,
	};
};

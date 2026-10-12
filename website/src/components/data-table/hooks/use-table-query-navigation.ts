'use client';

import { applyTableQueryPatch, TableQueryState } from '@/components/data-table/query-state';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useDebouncedRunner } from './use-debounced-runner';

type UpdateOptions = {
	debounceMs?: number;
};

export const useTableQueryNavigation = () => {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const runDebounced = useDebouncedRunner();

	const updateQuery = (patch: Partial<TableQueryState>, options?: UpdateOptions) => {
		runDebounced(() => {
			const nextSearchParams = applyTableQueryPatch(new URLSearchParams(searchParams.toString()), patch);
			const query = nextSearchParams.toString();
			startTransition(() => {
				router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
			});
		}, options?.debounceMs);
	};

	return {
		isPending,
		updateQuery,
	};
};

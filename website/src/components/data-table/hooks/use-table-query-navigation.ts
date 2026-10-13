'use client';

import { applyTableQueryPatch, TableQueryState } from '@/components/data-table/query-state';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useDebouncedRunner } from './use-debounced-runner';

type UpdateOptions = {
	debounceMs?: number;
};

export const useTableQueryNavigation = () => {
	const pathname = usePathname();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const runDebounced = useDebouncedRunner();

	const updateQuery = (patch: Partial<TableQueryState>, options?: UpdateOptions) => {
		runDebounced(() => {
			// Read the live URL: an open record dialog may have set its param after this update was scheduled
			const nextSearchParams = applyTableQueryPatch(new URLSearchParams(window.location.search), patch);
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

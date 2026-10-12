'use client';

import { TABLE_PAGE_SIZE_OPTIONS, type TableQueryState } from '@/components/data-table/query-state';
import type { Result } from '@/lib/result';
import { useEffect, useEffectEvent, useState } from 'react';
import { useDebouncedRunner } from './use-debounced-runner';

type TablePage<Row> = {
	tableRows: Row[];
	totalCount: number;
};

type LoadedTable<Row> = {
	query: TableQueryState;
	rows: Row[];
	totalRows: number;
	error: string | null;
};

// Table state for tables that must not touch the URL, e.g. a second table inside a dialog
export const useLocalTableQuery = <Row>(load: (query: TableQueryState) => Promise<Result<TablePage<Row>>>) => {
	const [query, setQuery] = useState<TableQueryState>({ page: 1, pageSize: TABLE_PAGE_SIZE_OPTIONS[0], search: '' });
	const [loaded, setLoaded] = useState<LoadedTable<Row> | null>(null);
	const runDebounced = useDebouncedRunner();
	const loadPage = useEffectEvent(load);

	useEffect(() => {
		let ignore = false;
		void loadPage(query).then((result) => {
			if (ignore) {
				return;
			}
			setLoaded(
				result.success
					? { query, rows: result.data.tableRows, totalRows: result.data.totalCount, error: null }
					: { query, rows: [], totalRows: 0, error: result.error },
			);
		});

		return () => {
			ignore = true;
		};
	}, [query]);

	const updateQuery = (patch: Partial<TableQueryState>, options?: { debounceMs?: number }) => {
		runDebounced(() => setQuery((previous) => ({ ...previous, ...patch })), options?.debounceMs);
	};

	return {
		query: { ...query, totalRows: loaded?.totalRows ?? 0 },
		rows: loaded?.rows ?? [],
		error: loaded?.error ?? null,
		isLoading: loaded?.query !== query,
		updateQuery,
	};
};

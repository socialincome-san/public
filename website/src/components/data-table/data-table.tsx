'use client';

import { ActionMenu, type ActionMenuItem } from '@/components/data-table/elements/action-menu';
import { BaseTable } from '@/components/data-table/elements/base-table';
import { DataTableEmptyState } from '@/components/data-table/elements/data-table-empty-state';
import { DataTableToolbar } from '@/components/data-table/elements/data-table-toolbar';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import DOMPurify from 'isomorphic-dompurify';
import { ReactNode, useEffect, useState } from 'react';

type DataTableProps<Row> = {
	title: ReactNode;
	error?: string | null;
	emptyMessage: string;
	actionMenuItems?: ActionMenuItem[];
	data: Row[];
	makeColumns: (hideProgramName?: boolean, hideLocalPartner?: boolean, translator?: Translator) => ColumnDef<Row>[];
	hideProgramName?: boolean;
	hideLocalPartner?: boolean;
	onRowClick?: (row: Row) => void;
	initialSorting?: SortingState;
	lang?: WebsiteLanguage;
	searchKeys?: (keyof Row)[];
};

export default function DataTable<Row>({
	title,
	error,
	emptyMessage,
	actionMenuItems,
	data,
	makeColumns,
	hideProgramName = false,
	hideLocalPartner = false,
	onRowClick,
	initialSorting,
	lang,
	searchKeys,
}: DataTableProps<Row>) {
	const translator = useTranslator(lang || 'en', 'website-me');
	const columns = makeColumns(hideProgramName, hideLocalPartner, translator);
	const [filteredData, setFilteredData] = useState(data);
	const [searchFilter, setSearchFilter] = useState('');
	const isEmpty = filteredData.length === 0;
	const isDatasetEmpty = data.length === 0;
	const resolvedSearchKeys = ((searchKeys as string[] | undefined) ??
		(Object.keys((data[0] as Record<string, unknown> | undefined) ?? {}) as string[])).filter(Boolean);
	const showControls = !error && !isDatasetEmpty;

	const filter = (search: string) => {
		if (!search) {
			setFilteredData(data);
			return;
		}
		const filtered = data.filter((row) => {
			return resolvedSearchKeys.some((key) =>
				String((row as Record<string, unknown>)[key] ?? '')
					.toLowerCase()
					.includes(search.toLowerCase()),
			);
		});
		setFilteredData(filtered);
	};

	useEffect(() => {
		setFilteredData(data);
		filter(searchFilter);
	}, [data]);

	useEffect(() => {
		filter(searchFilter);
	}, [searchFilter]);

	return (
		<div data-testid="data-table">
			<div className="mb-3 flex flex-wrap items-center justify-between">
				<h2 className="pb-4 text-3xl">
					{title} <span className="text-lg text-gray-500">({filteredData.length})</span>
				</h2>
			</div>
			<DataTableToolbar
				showControls={showControls}
				searchKeys={resolvedSearchKeys}
				onSearchChange={setSearchFilter}
				actionMenuItems={actionMenuItems}
			/>

			{error ? (
				<div className="p-4 text-red-600">Error: {error}</div>
			) : isDatasetEmpty ? (
				<DataTableEmptyState emptyMessage={emptyMessage} actions={actionMenuItems} />
			) : isEmpty ? (
				<div className="p-4 text-gray-500" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}></div>
			) : (
				<BaseTable data={filteredData} columns={columns} onRowClick={onRowClick} initialSorting={initialSorting} />
			)}
		</div>
	);
}

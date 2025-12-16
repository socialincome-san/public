'use client';

import { BaseTable } from '@/components/data-table/elements/base-table';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { Translator } from '@/lib/i18n/translator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import DOMPurify from 'isomorphic-dompurify';
import { ReactNode, useState } from 'react';
import { Input } from '../input';

type DataTableProps<Row> = {
	title: ReactNode;
	error?: string | null;
	emptyMessage: string;
	actions?: ReactNode;
	data: Row[];
	makeColumns: (hideProgramName?: boolean, translator?: Translator) => ColumnDef<Row>[];
	hideProgramName?: boolean;
	onRowClick?: (row: Row) => void;
	initialSorting?: SortingState;
	lang?: WebsiteLanguage;
	searchKeys?: string[];
};

export default function DataTable<Row>({
	title,
	error,
	emptyMessage,
	actions,
	data,
	makeColumns,
	hideProgramName = false,
	onRowClick,
	initialSorting,
	lang,
	searchKeys,
}: DataTableProps<Row>) {
	const translator = useTranslator(lang || 'en', 'website-me');
	const columns = makeColumns(hideProgramName, translator);
	const [filteredData, setFilteredData] = useState(data);
	const isEmpty = filteredData.length === 0;

	const filter = (search: string) => {
		const filtered = data.filter((row) => {
			return searchKeys?.some((key) =>
				(row[key as keyof Row] as string)?.toString().toLowerCase().includes(search.toLowerCase()),
			);
		});
		setFilteredData(filtered);
	};

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center justify-between">
				<h2 className="pb-4 text-3xl">
					{title} <span className="text-lg text-gray-500">({filteredData.length})</span>
				</h2>
				<div className="flex flex-wrap items-center gap-2">
					{searchKeys?.length && <Input className="w-64" placeholder="Search..." onChange={(e) => filter(e.target.value)} />}{' '}
					{actions ?? null}
				</div>
			</div>

			{error ? (
				<div className="p-4 text-red-600">Error: {error}</div>
			) : isEmpty ? (
				<div className="p-4 text-gray-500" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}></div>
			) : (
				<BaseTable data={filteredData} columns={columns} onRowClick={onRowClick} initialSorting={initialSorting} />
			)}
		</div>
	);
}

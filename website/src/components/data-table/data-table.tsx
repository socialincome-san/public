'use client';

import { BaseTable } from '@/components/data-table/elements/base-table';
import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import DOMPurify from 'isomorphic-dompurify';
import { ReactNode } from 'react';

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
}: DataTableProps<Row>) {
	const translator = useTranslator(lang || 'en', 'website-me');
	const columns = makeColumns(hideProgramName, translator);
	const isEmpty = data.length === 0;

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center justify-between">
				<h2 className="pb-4 text-3xl">
					{title} <span className="text-lg text-gray-500">({data.length})</span>
				</h2>
				{actions ?? null}
			</div>

			{error ? (
				<div className="p-4 text-red-600">Error: {error}</div>
			) : isEmpty ? (
				<div className="p-4 text-gray-500" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(emptyMessage) }}></div>
			) : (
				<BaseTable data={data} columns={columns} onRowClick={onRowClick} initialSorting={initialSorting} />
			)}
		</div>
	);
}

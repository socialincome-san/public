import type { DataTableConfig } from '@/components/data-table/table-config.types';
import type { RowData } from '@tanstack/react-table';
import { cloneElement, isValidElement, type ReactNode } from 'react';

const translateHeader = (header: unknown, label: string): ReactNode =>
	isValidElement<{ children?: ReactNode }>(header) ? cloneElement(header, { children: label }) : label;

export const translateManagementTableConfig = <Row extends RowData>(
	config: DataTableConfig<Row>,
	translations: {
		title: string;
		emptyMessage: string;
		columns: Record<string, string>;
	},
): DataTableConfig<Row> => ({
	...config,
	title: translations.title,
	emptyMessage: translations.emptyMessage,
	sortOptions: config.sortOptions?.map((option) => ({
		...option,
		label: translations.columns[option.id] ?? option.label,
	})),
	makeColumns: (...args) =>
		config.makeColumns(...args).map((column) => {
			const columnId = column.id ?? ('accessorKey' in column ? String(column.accessorKey) : '');
			const label = translations.columns[columnId];
			if (!label) {
				return column;
			}

			const header = column.header;
			if (typeof header !== 'function') {
				return { ...column, id: column.id ?? columnId, header: label };
			}

			return {
				...column,
				id: column.id ?? columnId,
				header: (context) => translateHeader(header(context), label),
			};
		}),
});

export const translateManagementFilters = <Filter extends { id: string; label: string; placeholder: string }>(
	filters: Filter[],
	translations: Record<string, { label: string; placeholder: string }>,
): Filter[] =>
	filters.map((filter) => ({
		...filter,
		...translations[filter.id],
	}));

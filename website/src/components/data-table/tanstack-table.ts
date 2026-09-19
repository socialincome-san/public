import type { RowData, CellContext as V9CellContext, HeaderContext as V9HeaderContext } from '@tanstack/react-table';
import type { LegacyColumnDef, LegacyFeatures } from '@tanstack/react-table/legacy';

export type VisibilityState = Record<string, boolean>;

export type ColumnDef<TData extends RowData, TValue = unknown> = LegacyColumnDef<TData, TValue>;
export type CellContext<TData extends RowData, TValue = unknown> = V9CellContext<LegacyFeatures, TData, TValue>;
export type HeaderContext<TData extends RowData, TValue = unknown> = V9HeaderContext<LegacyFeatures, TData, TValue>;

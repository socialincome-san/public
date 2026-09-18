import type { CellContext as V9CellContext, HeaderContext as V9HeaderContext } from '@tanstack/react-table';
import type { LegacyColumnDef, LegacyFeatures } from '@tanstack/react-table/legacy';

export type ColumnDef<TData, TValue = unknown> = LegacyColumnDef<TData, TValue>;
export type CellContext<TData, TValue = unknown> = V9CellContext<LegacyFeatures, TData, TValue>;
export type HeaderContext<TData, TValue = unknown> = V9HeaderContext<LegacyFeatures, TData, TValue>;

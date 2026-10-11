'use client';

import { CellType } from '@/components/data-table/elements/types';
import { createStorageReference, useStorage, useStorageDownloadURL } from '@/lib/firebase/hooks/use-storage';
import { DataTableDownloadCell } from '@socialincome/design-system/data-display/data-table-cells/data-table-cells';
import type { RowData } from '@tanstack/react-table';

export const DownloadCell = <TData extends RowData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const storagePath = String(ctx.getValue() ?? '');
	const storage = useStorage();
	const isDownloadablePath = storagePath.startsWith('users/');
	const storageRef = storagePath && isDownloadablePath ? createStorageReference(storage, storagePath) : undefined;
	const { data, loading } = useStorageDownloadURL(storageRef);

	if (!storagePath) {
		return null;
	}

	return <DataTableDownloadCell unavailable={!isDownloadablePath} href={loading ? undefined : (data ?? undefined)} />;
};

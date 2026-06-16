'use client';

import { CellType } from '@/components/data-table/elements/types';
import { useStorage, useStorageDownloadURL } from '@/lib/firebase/hooks/useStorage';
import { ref } from 'firebase/storage';
import { Download } from 'lucide-react';
import Link from 'next/link';

export const DownloadCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const storagePath = String(ctx.getValue() ?? '');
	const storage = useStorage();
	const isDownloadablePath = storagePath.startsWith('users/');
	const storageRef = storagePath && isDownloadablePath ? ref(storage, storagePath) : undefined;
	const { data, loading } = useStorageDownloadURL(storageRef);

	if (!storagePath) {
		return null;
	}

	if (!isDownloadablePath) {
		return <span className="text-muted-foreground text-sm">Download unavailable</span>;
	}

	if (!data || loading) {
		return null;
	}

	return (
		<Link
			className="text-primary inline-flex items-center font-medium underline-offset-4 hover:underline"
			href={data}
			target="_blank"
			rel="noopener noreferrer"
		>
			<Download className="mr-2 h-4 w-4" />
			Download
		</Link>
	);
};

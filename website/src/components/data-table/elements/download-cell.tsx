'use client';

import { CellType } from '@/components/data-table/elements/types';
import { useStorage, useStorageDownloadURL } from '@/lib/firebase/hooks/useStorage';
import { linkCn } from '@socialincome/ui';
import { ref } from 'firebase/storage';
import { Download } from 'lucide-react';
import Link from 'next/link';

export const DownloadCell = <TData, TValue>({ ctx }: CellType<TData, TValue>) => {
	const storagePath = String(ctx.getValue() ?? '');
	const storage = useStorage();
	const { data, loading } = useStorageDownloadURL(ref(storage, storagePath));

	if (!storagePath || !data || loading) {
		return null;
	}

	return (
		<Link className={linkCn()} href={data} target="_blank" rel="noopener noreferrer">
			<Download className="mr-2 h-4 w-4" />
			Download
		</Link>
	);
}

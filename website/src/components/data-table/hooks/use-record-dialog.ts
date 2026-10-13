'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

// The open record lives in the URL, so it can be linked, without refetching the page
export const useRecordDialog = (key: string) => {
	const searchParams = useSearchParams();
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const recordId = searchParams.get(key) ?? undefined;

	const setRecordId = (value: string | undefined) => {
		// Read the live URL: a debounced table query update may have changed it since the last render
		const nextSearchParams = new URLSearchParams(window.location.search);
		if (value) {
			nextSearchParams.set(key, value);
		} else {
			nextSearchParams.delete(key);
		}
		const query = nextSearchParams.toString();
		window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
	};

	const close = () => {
		setIsCreateOpen(false);
		setRecordId(undefined);
	};

	return {
		recordId,
		open: isCreateOpen || recordId !== undefined,
		openCreate: () => {
			setRecordId(undefined);
			setIsCreateOpen(true);
		},
		openRecord: (id: string) => setRecordId(id),
		close,
		onOpenChange: (open: boolean) => {
			if (!open) {
				close();
			}
		},
	};
};

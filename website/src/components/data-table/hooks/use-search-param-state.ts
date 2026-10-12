'use client';

import { useSearchParams } from 'next/navigation';

// Keeps UI state such as an open record in the URL, so it can be linked, without refetching the page
export const useSearchParamState = (key: string) => {
	const searchParams = useSearchParams();

	const setValue = (value: string | undefined) => {
		const nextSearchParams = new URLSearchParams(searchParams.toString());
		if (value) {
			nextSearchParams.set(key, value);
		} else {
			nextSearchParams.delete(key);
		}
		const query = nextSearchParams.toString();
		window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
	};

	return [searchParams.get(key) ?? undefined, setValue] as const;
};

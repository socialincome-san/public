'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

const BACKGROUND_COLOR_QUERY_KEY = ['globalBackgroundColor'];

export function useNavbarBackground() {
	const queryClient = useQueryClient();

	const { data: backgroundColor } = useQuery<string | null>({
		queryKey: BACKGROUND_COLOR_QUERY_KEY,
		queryFn: () => null,
		staleTime: Infinity,
	});

	const setBackgroundColor = useCallback(
		(color: string | null) => {
			queryClient.setQueryData(BACKGROUND_COLOR_QUERY_KEY, color);
		},
		[queryClient],
	);

	return { backgroundColor, setBackgroundColor };
}

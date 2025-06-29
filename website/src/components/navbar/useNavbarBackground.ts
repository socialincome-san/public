'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';

const BACKGROUND_COLOR_QUERY_KEY = ['globalBackgroundColor'];

export function useNavbarBackground() {
	const queryClient = useQueryClient();

	const { data: backgroundColor } = useQuery<string | null>({
		queryKey: BACKGROUND_COLOR_QUERY_KEY,
		queryFn: () => null, // Initial state
		staleTime: Infinity, // Treat this as always fresh local state
		initialData: null,
	});

	const setBackgroundColor = (color: string | null) => {
		queryClient.setQueryData(BACKGROUND_COLOR_QUERY_KEY, color);
	};

	return { backgroundColor, setBackgroundColor };
}

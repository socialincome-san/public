import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Utility hook that uses useQuery() to store a global state variable
 */
export const useNavbarBackgroundColor = () => {
	const queryClient = useQueryClient();

	const { data: backgroundColor } = useQuery<string | null>({
		queryKey: ['navbar/background-color'],
		initialData: null,
		// Optional: Disable automatic refetching since this is just state
		staleTime: Infinity,
	});
	const setBackgroundColor = (color: string | null) => queryClient.setQueryData(['navbar/background-color'], color);

	return { backgroundColor, setBackgroundColor };
};

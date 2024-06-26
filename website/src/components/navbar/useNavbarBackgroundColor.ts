import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * Utility hook that uses useQuery() to store a global state variable
 */
export const useNavbarBackgroundColor = () => {
	const queryClient = useQueryClient();

	const { data: backgroundColor } = useQuery<string>({
		enabled: false,
		queryKey: ['navbar/background-color'],
		initialData: 'bg-background',
	});
	const setBackgroundColor = (color: string) => queryClient.setQueryData(['navbar/background-color'], color);

	return { backgroundColor, setBackgroundColor };
};

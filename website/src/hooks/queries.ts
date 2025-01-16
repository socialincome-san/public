import { useApi } from '@/hooks/useApi';
import { useQuery } from '@tanstack/react-query';
import { Geo } from '@vercel/functions';

export const useGeolocation = () => {
	const api = useApi();
	const {
		data: geolocation,
		isLoading,
		error,
	} = useQuery({
		queryKey: ['geolocation'],
		queryFn: async () => {
			const response = await api.get('/api/geolocation');
			return (await response.json()) as Geo;
		},
		staleTime: Infinity,
	});

	return { geolocation, isLoading, error };
};

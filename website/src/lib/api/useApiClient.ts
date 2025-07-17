import { ApiClientContext } from '@/lib/api/api-client-provider';
import { useContext } from 'react';

export const useApiClient = () => {
	const apiClient = useContext(ApiClientContext);
	if (!apiClient) {
		throw new Error('useApiClient used outside of ApiClientProviderContext');
	}
	return apiClient;
};

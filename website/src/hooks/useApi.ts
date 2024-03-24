import { ApiProviderContext } from '@/components/providers/api-provider';
import { useContext } from 'react';

export class ApiClient {
	readonly token: string;

	constructor(firebaseIdToken: string) {
		this.token = firebaseIdToken;
	}

	get(path: string) {
		return this.request('GET', path);
	}

	post(path: string, body: Object) {
		return this.request('POST', path, body);
	}

	patch(path: string, body: any) {
		return this.request('PATCH', path, body);
	}

	private async request(method: 'GET' | 'POST' | 'PATCH', path: string, body?: any) {
		let url: URL;
		if (path.startsWith('/')) {
			url = new URL(path, window.location.origin);
			if (this.token) url.searchParams.append('firebaseAuthToken', this.token);
		} else {
			url = new URL(path);
		}

		return fetch(url, {
			method,
			body: JSON.stringify(body),
		});
	}
}

export const useApi = () => {
	const api = useContext(ApiProviderContext);
	if (!api) {
		throw new Error('useAPI used outside of ApiProvider');
	}
	return api;
};

import { verifyAppCheckFromRequest } from '@/modules/auth/auth.service';
import { NextRequest } from 'next/server';

type Handler<T> = (request: NextRequest, context: { params: T }) => Promise<Response>;

export const withAppCheck = <T>(handler: Handler<T>) => {
	return async (request: NextRequest, context: { params: T }): Promise<Response> => {
		const appCheckResult = await verifyAppCheckFromRequest(request);
		if (!appCheckResult.success) {
			console.warn('[withAppCheck] App Check verification failed', {
				error: appCheckResult.error,
				status: appCheckResult.status,
			});

			return new Response('Unauthorized', { status: 401 });
		}

		return handler(request, context);
	};
};

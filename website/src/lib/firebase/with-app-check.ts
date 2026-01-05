import { FirebaseService } from '@/lib/services/firebase/firebase.service';

type Handler = (request: Request) => Promise<Response>;

// Checks Firebase App Check token from the request before proceeding to the handler
// https://firebase.google.com/docs/app-check
export function withAppCheck(handler: Handler) {
	return async (request: Request): Promise<Response> => {
		const firebaseService = new FirebaseService();

		const appCheckResult = await firebaseService.verifyAppCheckFromRequest(request);
		if (!appCheckResult.success) {
			return new Response('Unauthorized', { status: 401 });
		}

		return handler(request);
	};
}

import { FirebaseAdminService } from '@/lib/services/firebase/firebase-admin.service';
import { NextRequest } from 'next/server';
import { logger } from '../utils/logger';

type Handler<T> = (request: NextRequest, context: { params: T }) => Promise<Response>;

// Checks Firebase App Check token from the request before proceeding to the handler
// https://firebase.google.com/docs/app-check
export const withAppCheck = <T>(handler: Handler<T>) => {
  return async (request: NextRequest, context: { params: T }): Promise<Response> => {
    const firebaseService = new FirebaseAdminService();

    const appCheckResult = await firebaseService.verifyAppCheckFromRequest(request);
    if (!appCheckResult.success) {
      logger.warn('[withAppCheck] App Check verification failed', {
        error: appCheckResult.error,
        status: appCheckResult.status,
      });

      return new Response('Unauthorized', { status: 401 });
    }

    return handler(request, context);
  };
};

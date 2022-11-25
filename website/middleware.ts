import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { financesMiddleware } from './pages/transparency/finances/[currency]';

/**
 * Unfortunately, nextjs only allows the definition of 1 global middleware on a root level.
 * To keep page specific middleware logic still modularized, I suggest to add them to the page definitions
 * and import them here.
 * @param request
 */
export const middleware = (request: NextRequest) => {
	return financesMiddleware(request) || NextResponse.next();
};

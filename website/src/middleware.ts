import { internationalizationMiddleware } from '@/i18n';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
	matcher: [
		// Skip internal paths (_next)
		'/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
	],
};

export function middleware(request: NextRequest) {
	return internationalizationMiddleware(request) || NextResponse.next();
}

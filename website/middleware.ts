import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
	if (request.nextUrl.pathname.endsWith('/transparency/finances')) {
		// TODO add logic leveraging the request.geo.country information
		return NextResponse.redirect(new URL(request.nextUrl.pathname + '/chf', request.url));
	}
	return NextResponse.next();
}

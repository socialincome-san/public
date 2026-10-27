import { NextResponse, type NextRequest } from 'next/server';
import { timingSafeEqual } from 'node:crypto';

// timingSafeEqual needs equal lengths; checking the length first reveals only the password's length.
const isPassword = (candidate: string, password: string) => {
	const candidateBytes = Buffer.from(candidate);
	const passwordBytes = Buffer.from(password);
	return candidateBytes.length === passwordBytes.length && timingSafeEqual(candidateBytes, passwordBytes);
};

const isAuthenticated = (request: NextRequest) => {
	const header = request.headers.get('authorization');
	const password = process.env.APP_PASSWORD;
	if (!header?.startsWith('Basic ') || !password) return false;
	try {
		const decoded = atob(header.slice(6));
		const separator = decoded.indexOf(':');
		return separator >= 0 && isPassword(decoded.slice(separator + 1), password);
	} catch {
		// Malformed credentials receive the same challenge as a wrong password.
		return false;
	}
};

export const proxy = (request: NextRequest) => {
	if (!isAuthenticated(request)) {
		return new NextResponse('Authentication required', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Image Generator", charset="UTF-8"',
			},
		});
	}
	// Browsers resend Basic credentials on cross-site form posts, so another site could start paid generations.
	// Sec-Fetch-Site comes from the browser and, unlike request.nextUrl, does not depend on the proxy in front of the app.
	const fetchSite = request.headers.get('sec-fetch-site');
	if (request.method !== 'GET' && request.method !== 'HEAD' && fetchSite !== null && fetchSite !== 'same-origin') {
		return new NextResponse('Cross-site request rejected', { status: 403 });
	}
	return NextResponse.next();
};

export const config = {
	matcher: ['/((?!_next/static|favicon.ico|images/showcase/).*)'],
};

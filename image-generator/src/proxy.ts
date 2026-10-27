import { NextResponse, type NextRequest } from 'next/server';
import { createHash, timingSafeEqual } from 'node:crypto';

// Hashing first gives both sides the same length, which timingSafeEqual requires.
const isPassword = (candidate: string, password: string) =>
	timingSafeEqual(createHash('sha256').update(candidate).digest(), createHash('sha256').update(password).digest());

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
	if (request.method !== 'GET' && request.method !== 'HEAD' && request.headers.get('origin') !== request.nextUrl.origin) {
		return new NextResponse('Cross-site request rejected', { status: 403 });
	}
	return NextResponse.next();
};

export const config = {
	matcher: ['/((?!_next/static|favicon.ico|images/showcase/).*)'],
};

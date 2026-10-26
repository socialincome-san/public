import { NextResponse, type NextRequest } from 'next/server';

export const proxy = (request: NextRequest) => {
	const header = request.headers.get('authorization');
	if (header?.startsWith('Basic ')) {
		try {
			const decoded = atob(header.slice(6));
			const separator = decoded.indexOf(':');
			if (separator >= 0 && process.env.APP_PASSWORD && decoded.slice(separator + 1) === process.env.APP_PASSWORD) {
				return NextResponse.next();
			}
		} catch {
			// Malformed credentials receive the same challenge as a wrong password.
		}
	}
	return new NextResponse('Authentication required', {
		status: 401,
		headers: {
			'WWW-Authenticate': 'Basic realm="Image Generator", charset="UTF-8"',
		},
	});
};

export const config = {
	matcher: ['/((?!_next/static|favicon.ico|images/showcase/).*)'],
};

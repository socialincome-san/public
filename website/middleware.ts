import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { bestGuessCurrency } from '../shared/src/utils/currency';

/**
 * Unfortunately, nextjs only allows the definition of 1 global middleware on a root level.
 */
export const middleware = (request: NextRequest) => {
	return financesMiddleware(request) || NextResponse.next();
};

/**
 * Forwards from /transparency/finances to /transparency/finances/[currency] according to the user's location.
 * @param request
 */
export const financesMiddleware = (request: NextRequest) => {
	if (request.nextUrl.pathname.endsWith('/transparency/finances')) {
		return redirectToCurrencyPage(request);
	}
	return undefined;
};

/**
 * Redirects to the currency subpage of the routed page.
 * E.g. a request to /transparency/finances gets redirected to /transparency/finances/chf if the request is coming from Switzerland
 * This allows us to combine incremental static prebuilt pages and personalization based on user's location.
 * @param request
 */
function redirectToCurrencyPage(request: NextRequest) {
	const currency = bestGuessCurrency(request.geo?.country);
	const redirectUrl = request.nextUrl.clone();
	redirectUrl.pathname = redirectUrl.pathname + '/' + currency.toLowerCase();
	return NextResponse.redirect(redirectUrl);
}

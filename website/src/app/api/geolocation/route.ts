import { VISITOR_COUNTRY_HEADER } from '@/lib/i18n/utils';

// https://vercel.com/docs/headers/request-headers
export const GET = (request: Request) => {
	try {
		const country = request.headers.get(VISITOR_COUNTRY_HEADER) ?? 'Unknown';
		const ip = request.headers.get('x-real-ip') ?? 'Unknown';
		const region = request.headers.get('x-vercel-ip-country-region') ?? 'Unknown';
		const encodedCity = request.headers.get('x-vercel-ip-city');
		const city = encodedCity ? decodeURIComponent(encodedCity) : 'Unknown';

		return Response.json({
			country,
			region,
			city,
			ip,
		});
	} catch (error: unknown) {
		return new Response(null, { status: 500, statusText: String(error) });
	}
};

import { getVisitorLocation } from '@/lib/geo/visitor-geo';

export const GET = (request: Request) => {
	try {
		const { country, region, city, ip } = getVisitorLocation(request.headers);

		return Response.json({
			country: country ?? 'Unknown',
			region: region ?? 'Unknown',
			city: city ?? 'Unknown',
			ip: ip ?? 'Unknown',
		});
	} catch (error: unknown) {
		return new Response(null, { status: 500, statusText: String(error) });
	}
};

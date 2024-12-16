import { handleApiError } from '@/app/api/auth';
import { Geo, geolocation } from '@vercel/functions';

export async function GET(request: Request) {
	try {
		const geo = geolocation(request);

		return Response.json({ country: geo.country } as Geo);
	} catch (error: any) {
		return handleApiError(error);
	}
}

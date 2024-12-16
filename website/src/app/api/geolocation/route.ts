import { geolocation } from '@vercel/functions';
import { handleApiError } from '@/app/api/auth';

export async function GET(request: Request) {
	try {
		return Response.json(geolocation(request));
	} catch (error: any) {
		return handleApiError(error);
	}
}

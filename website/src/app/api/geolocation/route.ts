export const GET = async (request: Request) => {
	try {
		const country = request.headers.get('cf-ipcountry') || 'Unknown';
		const ip = request.headers.get('cf-connecting-ip') || 'Unknown';
		const region = request.headers.get('cf-region') || 'Unknown';
		const city = request.headers.get('cf-city') || 'Unknown';

		return Response.json({
			country,
			region,
			city,
			ip,
		});
	} catch (error: any) {
		return new Response(null, { status: 500, statusText: error.message });
	}
}

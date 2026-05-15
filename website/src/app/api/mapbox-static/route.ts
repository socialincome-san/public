import { getCountryStaticMapUrl, isMapboxMapVariant } from '@/lib/mapbox/country-map';

const MAP_IMAGE_CACHE_HEADER = 'no-store, no-cache, must-revalidate, proxy-revalidate';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const GET = async (request: Request) => {
	const { searchParams } = new URL(request.url);
	const isoCode = searchParams.get('isoCode')?.trim();
	const variantParam = searchParams.get('variant')?.trim() ?? 'main';

	if (!isoCode) {
		return Response.json({ error: 'Missing isoCode query parameter.' }, { status: 400 });
	}

	if (!isMapboxMapVariant(variantParam)) {
		return Response.json({ error: 'Invalid map variant.' }, { status: 400 });
	}

	const mapboxToken = process.env.MAPBOX_TOKEN;

	if (!mapboxToken) {
		return Response.json({ error: 'Map service is not configured.' }, { status: 500 });
	}

	const mapboxStaticImageUrl = await getCountryStaticMapUrl({
		accessToken: mapboxToken,
		isoCode,
		variant: variantParam,
	});

	if (!mapboxStaticImageUrl) {
		return Response.json({ error: 'Unable to build map bounds.' }, { status: 404 });
	}

	const mapboxResponse = await fetch(mapboxStaticImageUrl, {
		cache: 'no-store',
	});

	if (!mapboxResponse.ok || !mapboxResponse.body) {
		return Response.json({ error: 'Unable to generate map image.' }, { status: 502 });
	}

	const contentType = mapboxResponse.headers.get('content-type') ?? 'image/png';

	return new Response(mapboxResponse.body, {
		status: 200,
		headers: {
			'Cache-Control': MAP_IMAGE_CACHE_HEADER,
			'Content-Type': contentType,
		},
	});
};

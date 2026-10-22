import { VISITOR_COUNTRY_HEADER } from '@/lib/i18n/utils';

export const GET = (request: Request) =>
	Response.json({ country: request.headers.get(VISITOR_COUNTRY_HEADER)?.toUpperCase() ?? null });

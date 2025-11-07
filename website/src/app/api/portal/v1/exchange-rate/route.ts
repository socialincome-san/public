import { ExchangeRateImportService } from '@socialincome/shared/src/database/services/exchange-rate/exchange-rate-import.service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Import exchange rates
 * @description Imports exchange rates from external API into the database.
 * @auth apikey
 *   type: apiKey
 *   in: header
 *   name: x-api-key
 * @openapi
 */
export async function POST(request: NextRequest) {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.EXCHANGE_RATES_IMPORT_API || !process.env.EXCHANGE_RATES_IMPORT_API) {
		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	const service = new ExchangeRateImportService();

	try {
		await service.import();
		return NextResponse.json(null, { status: 204 });
	} catch (error) {
		console.error('Error during exchange rate import:', error);
		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
}

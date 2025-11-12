import { ExchangeRateImportService } from '@socialincome/shared/src/database/services/exchange-rate/exchange-rate-import.service';
import { logger } from '@socialincome/shared/src/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Import exchange rates
 * @description Imports exchange rates from external API into the database.
 * @auth apikey
 *   type: apiKey
 *   in: header
 *   name: x-api-key
 * @response 201 - Exchange rates imported successfully
 * @openapi
 */
export async function POST(request: NextRequest) {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.EXCHANGE_RATES_IMPORT_API || !process.env.EXCHANGE_RATES_IMPORT_API) {
		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	const service = new ExchangeRateImportService();

	try {
		const result = await service.import();
		if (!result.success) {
			logger.alert(`Exchange rate import failed: ${result.error}`, { result }, { component: 'exchange-rate-import' });
			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		logger.alert(`Exchange rate import failed: ${error}`, { error }, { component: 'exchange-rate-import' });
		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
}

import { PaymentFileImportService } from '@socialincome/shared/src/database/services/payment-file-import/payment-file-import.service';
import { logger } from '@socialincome/shared/src/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Import payment files
 * @description Imports payment files from post finance.
 * @auth apikey
 *   type: apiKey
 *   in: header
 *   name: x-api-key
 * @response PaymentFilesImportResult | PaymentFilesImportError
 * @openapi
 */
export async function POST(request: NextRequest) {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.EXCHANGE_RATES_IMPORT_API || !process.env.EXCHANGE_RATES_IMPORT_API) {
		logger.error('Scheduler API key not set or wrong');
		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		logger.error('Payment files storage bucket env var not set');
		return NextResponse.json({ ok: false, error: 'Internal server errororized' }, { status: 500 });
	}

	const service = new PaymentFileImportService(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);

	try {
		const result = await service.importPaymentFiles();
		if (!result.success) {
			logger.alert(`Payment files import failed: ${result.error}`, { result }, { component: 'payment-files-import' });
			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
		return NextResponse.json(result.data, { status: 201 });
	} catch (error) {
		logger.alert(`Payment files import failed: ${error}`, { error }, { component: 'payment-files-import' });
		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
}

import { ExchangeRateImportService } from '@/lib/services/exchange-rate/exchange-rate-import.service';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.SCHEDULER_API_KEY || !process.env.SCHEDULER_API_KEY) {
		logger.alert('Scheduler API key not set or wrong');
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

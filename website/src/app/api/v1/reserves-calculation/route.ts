import { services } from '@/lib/services/services';
import { logger } from '@/lib/utils/logger';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.SCHEDULER_API_KEY || !process.env.SCHEDULER_API_KEY) {
		logger.alert('Scheduler API key not set or wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		logger.alert('Payment files storage bucket env var not set');

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}

	const service = services.createReservesCalculation(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);

	try {
		const result = await service.calculate();
		if (!result.success) {
			logger.alert(`Reserves calculation failed: ${result.error}`, { result }, { component: 'reserves-calculation' });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		logger.alert(`Reserves calculation failed: ${String(error)}`, { error }, { component: 'reserves-calculation' });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};

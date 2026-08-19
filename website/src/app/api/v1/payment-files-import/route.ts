import { services } from '@/lib/services/services';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	const apiKey = request.headers.get('x-api-key');

	if (apiKey !== process.env.SCHEDULER_API_KEY || !process.env.SCHEDULER_API_KEY) {
		console.error('Scheduler API key not set or wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		console.error('Payment files storage bucket env var not set');

		return NextResponse.json({ ok: false, error: 'Internal server errororized' }, { status: 500 });
	}

	const service = services.createPaymentFileImport(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);

	try {
		const result = await service.importPaymentFiles();
		if (!result.success) {
			console.error(`Payment files import failed: ${result.error}`, { result });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
		if (result.data.length > 0) {
			console.info(
				`Payment files import succeeded. Updated following payment events: ${result.data.map((c) => c.id).join(', ')}`,
			);
		} else {
			console.info('Payment files import succeeded. No payment events updated.');
		}

		return NextResponse.json(result.data, { status: 201 });
	} catch (error) {
		console.error(`Payment files import failed: ${String(error)}`, { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};

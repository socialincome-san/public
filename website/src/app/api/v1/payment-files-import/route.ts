import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { paymentImportRequestSchema } from '@/modules/payment-imports/payment-import.schemas';
import { importPaymentFiles } from '@/modules/payment-imports/payment-import.service';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	const requestInput = paymentImportRequestSchema.safeParse({
		apiKey: request.headers.get('x-api-key'),
	});

	if (!process.env.SCHEDULER_API_KEY) {
		console.error(`${SLACK_ALERT}: Scheduler API key not set`);

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!requestInput.success || requestInput.data.apiKey !== process.env.SCHEDULER_API_KEY) {
		console.warn('Scheduler API key wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		console.error(`${SLACK_ALERT}: Payment files storage bucket env var not set`);

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}

	try {
		const result = await importPaymentFiles(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);
		if (!result.success) {
			console.error(`${SLACK_ALERT}: Payment files import failed: ${result.error}`, { result });

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
		console.error(`${SLACK_ALERT}: Payment files import failed: ${String(error)}`, { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};

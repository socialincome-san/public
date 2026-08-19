import { services } from '@/lib/services/services';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { NextRequest, NextResponse } from 'next/server';

export const POST = async (request: NextRequest) => {
	const apiKey = request.headers.get('x-api-key');

	if (!process.env.SCHEDULER_API_KEY) {
		console.error(`${SLACK_ALERT}: Scheduler API key not set`);

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	if (apiKey !== process.env.SCHEDULER_API_KEY) {
		console.warn('Scheduler API key wrong');

		return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const result = await services.exchangeRateImport.import();
		if (!result.success) {
			console.error(`${SLACK_ALERT}: Exchange rate import failed: ${String(result.error)}`, { result });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		console.error(`${SLACK_ALERT}: Exchange rate import failed: ${String(error)}`, { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};

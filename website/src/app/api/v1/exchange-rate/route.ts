import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { importExchangeRates } from '@/modules/exchange-rates/exchange-rate.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

export const GET = withSchedulerAuth(async () => {
	try {
		const result = await importExchangeRates();
		if (!result.success) {
			sendSlackAlert('Exchange rate import failed', { result });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		sendSlackAlert('Exchange rate import failed', { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

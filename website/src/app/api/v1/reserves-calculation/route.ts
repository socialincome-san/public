import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { calculateReserves } from '@/modules/reserves/reserve.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

const calculateReservesJob = withSchedulerAuth(async () => {
	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		sendSlackAlert('Payment files storage bucket env var not set');

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}

	try {
		const result = await calculateReserves(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);
		if (!result.success) {
			sendSlackAlert('Reserves calculation failed', { result });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		sendSlackAlert('Reserves calculation failed', { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

// Vercel Cron calls GET; POST stays for manual runs.
export const GET = calculateReservesJob;
export const POST = calculateReservesJob;

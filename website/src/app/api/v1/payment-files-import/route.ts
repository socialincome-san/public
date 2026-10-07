import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { importPaymentFiles } from '@/modules/payment-imports/payment-import.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

// The SFTP download and import can be slow; matches the former Cloud Run request timeout.
export const maxDuration = 300;

const importPaymentFilesJob = withSchedulerAuth(async () => {
	if (!process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET) {
		sendSlackAlert('Payment files storage bucket env var not set');

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}

	try {
		const result = await importPaymentFiles(process.env.POSTFINANCE_PAYMENTS_FILES_BUCKET);
		if (!result.success) {
			sendSlackAlert('Payment files import failed', { result });

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
		sendSlackAlert('Payment files import failed', { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

// Vercel Cron calls GET; POST stays for manual runs.
export const GET = importPaymentFilesJob;
export const POST = importPaymentFilesJob;

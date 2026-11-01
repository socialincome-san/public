import { now } from '@/lib/utils/now';
import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { sendDonationCertificateReadyEmails } from '@/modules/donation-certificates/donation-certificate-email.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

export const GET = withSchedulerAuth(async () => {
	const date = now();
	if (date.getUTCMonth() !== 0) {
		return NextResponse.json({ skipped: true }, { status: 200 });
	}

	const year = date.getUTCFullYear() - 1;
	try {
		const result = await sendDonationCertificateReadyEmails(year);
		if (!result.success) {
			sendSlackAlert('Annual donation certificate emails failed', { result, year });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json(result.data, { status: 201 });
	} catch (error) {
		sendSlackAlert('Annual donation certificate emails failed', { error, year });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

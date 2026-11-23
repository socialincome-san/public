import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { sendNotification } from '@/modules/mail/mail.service';
import { getLastMonthSummary } from '@/modules/monthly-summaries/monthly-summary.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

export const GET = withSchedulerAuth(async () => {
	try {
		const summaryResult = await getLastMonthSummary();
		if (!summaryResult.success) {
			sendSlackAlert('Monthly summary failed', { summaryResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		// Vercel Cron can deliver the same event twice; the key makes the second run a no-op.
		const month = summaryResult.data.period.from.toISOString().slice(0, 7);
		const emailResult = await sendNotification({
			type: 'monthly-summary',
			data: summaryResult.data,
			idempotencyKey: `monthly-summary:${month}`,
		});
		if (!emailResult.success) {
			sendSlackAlert('Monthly summary email failed', { emailResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: emailResult.data.sent > 0 ? 201 : 200 });
	} catch (error) {
		sendSlackAlert('Monthly summary failed', { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

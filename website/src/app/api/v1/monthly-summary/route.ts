import { sendSlackAlert } from '@/lib/utils/slack-alert';
import { hasSentMailWithSubject, sendMail } from '@/modules/mail/mail.service';
import { createMonthlySummaryEmail } from '@/modules/monthly-summaries/monthly-summary-email.service';
import { getLastMonthSummary } from '@/modules/monthly-summaries/monthly-summary.service';
import { withSchedulerAuth } from '@/server/scheduler-auth';
import { NextResponse } from 'next/server';

const getRecipients = () =>
	(process.env.MONTHLY_SUMMARY_RECIPIENTS ?? '')
		.split(',')
		.map((recipient) => recipient.trim())
		.filter(Boolean);

export const GET = withSchedulerAuth(async () => {
	try {
		const recipients = getRecipients();
		if (recipients.length === 0) {
			sendSlackAlert('Monthly summary recipients not set');

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const summaryResult = await getLastMonthSummary();
		if (!summaryResult.success) {
			sendSlackAlert('Monthly summary failed', { summaryResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const emailContentResult = createMonthlySummaryEmail(summaryResult.data);
		if (!emailContentResult.success) {
			sendSlackAlert('Monthly summary email creation failed', { emailContentResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const { subject, text } = emailContentResult.data;
		// Vercel Cron can deliver the same event twice.
		const alreadySentResult = await hasSentMailWithSubject(subject);
		if (!alreadySentResult.success) {
			sendSlackAlert('Monthly summary failed', { alreadySentResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}
		if (alreadySentResult.data) {
			console.info('Monthly summary already sent', { subject });

			return NextResponse.json({}, { status: 200 });
		}

		const emailResult = await sendMail({
			to: recipients,
			subject,
			text,
		});
		if (!emailResult.success) {
			sendSlackAlert('Monthly summary email failed', { emailResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		sendSlackAlert('Monthly summary failed', { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
});

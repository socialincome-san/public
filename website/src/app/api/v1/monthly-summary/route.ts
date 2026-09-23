import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { sendMail } from '@/modules/mail/mail.service';
import { createMonthlySummaryEmail } from '@/modules/monthly-summaries/monthly-summary-email.service';
import { getLastMonthSummary } from '@/modules/monthly-summaries/monthly-summary.service';
import { NextRequest, NextResponse } from 'next/server';

const getRecipients = () =>
	(process.env.MONTHLY_SUMMARY_RECIPIENTS ?? '')
		.split(',')
		.map((recipient) => recipient.trim())
		.filter(Boolean);

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
		const recipients = getRecipients();
		if (recipients.length === 0) {
			console.error(`${SLACK_ALERT}: Monthly summary recipients not set`);

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const summaryResult = await getLastMonthSummary();
		if (!summaryResult.success) {
			console.error(`${SLACK_ALERT}: Monthly summary failed: ${summaryResult.error}`, { summaryResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const emailContentResult = createMonthlySummaryEmail(summaryResult.data);
		if (!emailContentResult.success) {
			console.error(`${SLACK_ALERT}: Monthly summary email creation failed: ${emailContentResult.error}`, {
				emailContentResult,
			});

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const { subject, text } = emailContentResult.data;
		const emailResult = await sendMail({
			to: recipients,
			subject,
			text,
		});
		if (!emailResult.success) {
			console.error(`${SLACK_ALERT}: Monthly summary email failed: ${emailResult.error}`, { emailResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		return NextResponse.json({}, { status: 201 });
	} catch (error) {
		console.error(`${SLACK_ALERT}: Monthly summary failed: ${String(error)}`, { error });

		return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
	}
};

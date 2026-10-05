import { createMonthlySummaryTemplateData, MONTHLY_SUMMARY_TEMPLATE } from '@/lib/services/sendgrid/sendgrid-mail.service';
import { services } from '@/lib/services/services';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
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

		const summaryResult = await services.monthlySummary.getLastMonth();
		if (!summaryResult.success) {
			console.error(`${SLACK_ALERT}: Monthly summary failed: ${summaryResult.error}`, { summaryResult });

			return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
		}

		const month = summaryResult.data.period.from.toLocaleDateString('en-US', {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC',
		});

		const emailResult = await services.sendgridMail.send({
			to: recipients,
			subject: `Monthly summary — ${month}`,
			text: '',
			template: MONTHLY_SUMMARY_TEMPLATE,
			data: createMonthlySummaryTemplateData(summaryResult.data),
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

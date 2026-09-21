import { services } from '@/lib/services/services';
import { SLACK_ALERT } from '@/lib/utils/slack-alert';
import { sendMail } from '@/modules/mail/mail.service';
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

		const { from } = summaryResult.data.period;
		const month = from.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
		const { moneyIn, moneyOut } = summaryResult.data;
		const { contributors, campaigns, programs, recipients: newRecipients } = summaryResult.data.new;
		const { overall, countries, localPartners } = summaryResult.data.stats;
		const formatStats = (stats: typeof overall) =>
			`Recipients: ${stats.recipients.active} active, ${stats.recipients.former} former, ${stats.recipients.suspended} suspended, ${stats.recipients.future} future\nCandidates: ${stats.candidates}\nPayouts: ${stats.payouts.total} total, ${stats.payouts.confirmed} confirmed, ${stats.payouts.contested} contested, ${stats.payouts.failed} failed`;
		const text = `Hi,

Here's the summary for ${month}:

Money
- In: CHF ${moneyIn.amountChf.toLocaleString('en-CH')} (${moneyIn.count} contributions)
- Out: CHF ${moneyOut.amountChf.toLocaleString('en-CH')} (${moneyOut.count} payouts)

New
- ${contributors} contributors
- ${campaigns} campaigns
- ${programs} programs
- ${newRecipients} recipients

Overall
${formatStats(overall)}

Countries
${Object.entries(countries)
	.map(([country, stats]) => `${country}\n${formatStats(stats)}`)
	.join('\n')}

Local Program Partners
${localPartners
	.map(
		(partner) =>
			`${partner.name} (${partner.countryIsoCodes.join(', ') || 'n/a'}): ${partner.stats.recipients.active}/${partner.stats.recipients.former}/${partner.stats.recipients.suspended}/${partner.stats.recipients.future} recipients in ${partner.programs} programs\n${formatStats(partner.stats)}`,
	)
	.join('\n')}`;

		const emailResult = await sendMail({
			to: recipients,
			subject: `Monthly summary — ${month}`,
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

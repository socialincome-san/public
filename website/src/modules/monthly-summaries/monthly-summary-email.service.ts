import { resultFail, resultOk, type Result } from '@/lib/result';
import type {
	MonthlySummary,
	MonthlySummaryEmail,
	MonthlySummaryStats,
	MonthlySummaryTemplateData,
} from './monthly-summary.types';

export const createMonthlySummaryEmail = (summary: MonthlySummary): Result<MonthlySummaryEmail> => {
	const templateId = process.env.SENDGRID_MONTHLY_SUMMARY_TEMPLATE_ID?.trim();
	if (!templateId) {
		return resultFail('Missing monthly summary SendGrid template');
	}

	try {
		const { from } = summary.period;
		const month = from.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
		const { moneyIn, moneyOut } = summary;
		const { contributors, campaigns, programs, recipients: newRecipients } = summary.new;
		const { overall, countries, localPartners } = summary.stats;
		const text = `Hi,

Here's the summary for ${month}:

Money
- In: CHF ${formatAmount(moneyIn.amountChf)} (${moneyIn.count} contributions)
- Out: CHF ${formatAmount(moneyOut.amountChf)} (${moneyOut.count} payouts)

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

		return resultOk({
			subject: `Monthly summary — ${month}`,
			text,
			template: { id: templateId, data: createTemplateData(summary, month) },
		});
	} catch (error) {
		console.error('Could not create monthly summary email', { error });

		return resultFail('Could not create monthly summary email');
	}
};

const createTemplateData = (summary: MonthlySummary, month: string): MonthlySummaryTemplateData => {
	const { overall, countries, localPartners } = summary.stats;

	return {
		month,
		moneyInAmount: formatAmount(summary.moneyIn.amountChf),
		moneyInCount: summary.moneyIn.count,
		moneyOutAmount: formatAmount(summary.moneyOut.amountChf),
		moneyOutCount: summary.moneyOut.count,
		contributors: summary.new.contributors,
		campaigns: summary.new.campaigns,
		programs: summary.new.programs,
		recipients: summary.new.recipients,
		overallRecipientsActive: overall.recipients.active,
		overallRecipientsFormer: overall.recipients.former,
		overallRecipientsSuspended: overall.recipients.suspended,
		overallRecipientsFuture: overall.recipients.future,
		overallCandidates: overall.candidates,
		overallPayoutsTotal: overall.payouts.total,
		overallPayoutsConfirmed: overall.payouts.confirmed,
		overallPayoutsContested: overall.payouts.contested,
		overallPayoutsFailed: overall.payouts.failed,
		countries: Object.entries(countries).map(([name, stats]) => ({
			name,
			recipientsActive: stats.recipients.active,
			recipientsFormer: stats.recipients.former,
			recipientsSuspended: stats.recipients.suspended,
			recipientsFuture: stats.recipients.future,
			candidates: stats.candidates,
			payoutsTotal: stats.payouts.total,
			payoutsConfirmed: stats.payouts.confirmed,
			payoutsContested: stats.payouts.contested,
			payoutsFailed: stats.payouts.failed,
		})),
		localPartners: localPartners.map((partner) => ({
			name: partner.name,
			country: partner.countryIsoCodes.join(', ') || 'n/a',
			recipientsActive: partner.stats.recipients.active,
			recipientsFormer: partner.stats.recipients.former,
			recipientsSuspended: partner.stats.recipients.suspended,
			recipientsFuture: partner.stats.recipients.future,
			programs: partner.programs,
		})),
	};
};

const formatStats = (stats: MonthlySummaryStats): string =>
	`Recipients: ${stats.recipients.active} active, ${stats.recipients.former} former, ${stats.recipients.suspended} suspended, ${stats.recipients.future} future\nCandidates: ${stats.candidates}\nPayouts: ${stats.payouts.total} total, ${stats.payouts.confirmed} confirmed, ${stats.payouts.contested} contested, ${stats.payouts.failed} failed`;

const formatAmount = (amount: number): string => amount.toLocaleString('en-CH').replaceAll('’', "'");

import { MonthlySummary } from './monthly-summary.service';

export class MonthlySummaryEmailTemplate {
	create(summary: MonthlySummary): { subject: string; text: string; dynamicTemplateData: Record<string, unknown> } {
		const { from } = summary.period;
		const month = from.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
		const { moneyIn, moneyOut } = summary;
		const { contributors, campaigns, programs, recipients: newRecipients } = summary.new;
		const { overall, countries, localPartners } = summary.stats;
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

		return {
			subject: `Monthly summary — ${month}`,
			text,
			dynamicTemplateData: {
				month,
				moneyInAmount: moneyIn.amountChf.toLocaleString('en-CH'),
				moneyInCount: moneyIn.count,
				moneyOutAmount: moneyOut.amountChf.toLocaleString('en-CH'),
				moneyOutCount: moneyOut.count,
				contributors,
				campaigns,
				programs,
				recipients: newRecipients,
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
			},
		};
	}
}

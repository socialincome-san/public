import { MonthlySummary } from './monthly-summary.service';

export class MonthlySummaryEmailTemplate {
	create(summary: MonthlySummary): { subject: string; text: string } {
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

		return { subject: `Monthly summary — ${month}`, text };
	}
}

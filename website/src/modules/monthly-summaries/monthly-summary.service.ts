import { PayoutInterval, PayoutStatus } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { countCampaignsCreatedBetween } from '@/modules/campaigns/campaign.service';
import { getSucceededContributionSummary } from '@/modules/contributions/contribution.service';
import { countContributorsCreatedBetween } from '@/modules/contributors/contributor.service';
import { getPaidPayoutSummary } from '@/modules/payouts/payout.service';
import { countProgramsCreatedBetween } from '@/modules/programs/program-reference.service';
import { getRecipientMonthlySummarySource, recipientStatusService } from '@/modules/recipients/recipient.service';
import type { RecipientMonthlySummarySource } from '@/modules/recipients/recipient.types';
import type { MonthlySummary, MonthlySummaryStats } from './monthly-summary.types';

export const getLastMonthSummary = async (): Promise<ServiceResult<MonthlySummary>> => {
	try {
		const now = new Date();
		const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
		const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
		const [contributionResult, payoutResult, contributorResult, campaignResult, programResult, recipientResult] =
			await Promise.all([
				getSucceededContributionSummary({ gte: from, lt: to }),
				getPaidPayoutSummary({ gte: from, lt: to }),
				countContributorsCreatedBetween(from, to),
				countCampaignsCreatedBetween(from, to),
				countProgramsCreatedBetween(from, to),
				getRecipientMonthlySummarySource(from, to),
			]);

		if (!contributionResult.success) {
			return resultFail(contributionResult.error);
		}
		if (!payoutResult.success) {
			return resultFail(payoutResult.error);
		}
		if (!contributorResult.success) {
			return resultFail(contributorResult.error);
		}
		if (!campaignResult.success) {
			return resultFail(campaignResult.error);
		}
		if (!programResult.success) {
			return resultFail(programResult.error);
		}
		if (!recipientResult.success) {
			return resultFail(recipientResult.error);
		}

		const stats = buildSummaryStats(recipientResult.data.recipients, now);

		return resultOk({
			period: { from, to },
			moneyIn: contributionResult.data,
			moneyOut: payoutResult.data,
			new: {
				contributors: contributorResult.data,
				campaigns: campaignResult.data,
				programs: programResult.data,
				recipients: recipientResult.data.newRecipientCount,
			},
			stats,
		});
	} catch (error) {
		console.error('Unable to load monthly summary', { error });

		return resultFail('Unable to load monthly summary');
	}
};

const buildSummaryStats = (
	recipientRecords: RecipientMonthlySummarySource['recipients'],
	nowDate: Date,
): MonthlySummary['stats'] => {
	const overall = emptyStats();
	const countries = new Map<string, MonthlySummaryStats>();
	const localPartners = new Map<
		string,
		{ stats: MonthlySummaryStats; countryIsoCodes: Set<string>; programIds: Set<string> }
	>();

	for (const record of recipientRecords) {
		addRecord(overall, record, nowDate);

		const countryIsoCode = record.program?.country.isoCode;
		if (countryIsoCode) {
			const countryStats = countries.get(countryIsoCode) ?? emptyStats();
			countries.set(countryIsoCode, countryStats);
			addRecord(countryStats, record, nowDate);
		}

		const partner = localPartners.get(record.localPartner.name) ?? {
			stats: emptyStats(),
			countryIsoCodes: new Set<string>(),
			programIds: new Set<string>(),
		};
		localPartners.set(record.localPartner.name, partner);
		addRecord(partner.stats, record, nowDate);
		if (countryIsoCode) {
			partner.countryIsoCodes.add(countryIsoCode);
		}
		if (record.programId) {
			partner.programIds.add(record.programId);
		}
	}

	return {
		overall,
		countries: Object.fromEntries(countries),
		localPartners: [...localPartners.entries()].map(([name, partner]) => ({
			name,
			countryIsoCodes: [...partner.countryIsoCodes],
			programs: partner.programIds.size,
			stats: partner.stats,
		})),
	};
};

const addRecord = (
	stats: MonthlySummaryStats,
	record: RecipientMonthlySummarySource['recipients'][number],
	nowDate: Date,
): void => {
	if (record.programId === null) {
		stats.candidates++;
	} else {
		const statusResult = recipientStatusService.getRecipientLifecycleStatus({
			startDate: record.startDate,
			suspendedAt: record.suspendedAt,
			paidOrConfirmedCount: record.payouts.filter(
				({ status }) => status === PayoutStatus.paid || status === PayoutStatus.confirmed,
			).length,
			programDurationInMonths: record.program?.programDurationInMonths ?? 0,
			payoutInterval: record.program?.payoutInterval ?? PayoutInterval.monthly,
			nowDate,
		});
		if (statusResult.success) {
			const status = statusResult.data === 'completed' ? 'former' : statusResult.data;
			stats.recipients[status]++;
		}
	}

	for (const payout of record.payouts) {
		if (payout.status === PayoutStatus.paid || payout.status === PayoutStatus.confirmed) {
			stats.payouts.total++;
		}
		if (payout.status === PayoutStatus.confirmed) {
			stats.payouts.confirmed++;
		}
		if (payout.status === PayoutStatus.contested) {
			stats.payouts.contested++;
		}
		if (payout.status === PayoutStatus.failed) {
			stats.payouts.failed++;
		}
	}
};

const emptyStats = (): MonthlySummaryStats => ({
	recipients: { active: 0, former: 0, suspended: 0, future: 0 },
	candidates: 0,
	payouts: { total: 0, confirmed: 0, contested: 0, failed: 0 },
});

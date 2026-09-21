import { PrismaClient } from '@/generated/prisma/client';
import type { recipientStatusService as recipientStatusFunctions } from '@/modules/recipients/recipient.service';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';

type RecipientCounts = { active: number; former: number; suspended: number; future: number };
type PayoutCounts = { total: number; confirmed: number; contested: number; failed: number };
type SummaryStats = { recipients: RecipientCounts; candidates: number; payouts: PayoutCounts };

export type MonthlySummary = {
	period: { from: Date; to: Date };
	moneyIn: { amountChf: number; count: number };
	moneyOut: { amountChf: number; count: number };
	new: { contributors: number; campaigns: number; programs: number; recipients: number };
	stats: {
		overall: SummaryStats;
		countries: Record<string, SummaryStats>;
		localPartners: {
			name: string;
			countryIsoCodes: string[];
			programs: number;
			stats: SummaryStats;
		}[];
	};
};

export class MonthlySummaryService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly recipientStatusService: typeof recipientStatusFunctions,
	) {
		super(db);
	}

	async getLastMonth(): Promise<ServiceResult<MonthlySummary>> {
		try {
			const now = new Date();
			const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
			const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
			const [contributions, payouts, contributors, campaigns, programs, recipients, recipientRecords] = await Promise.all([
				this.db.contribution.aggregate({
					where: { status: 'succeeded', createdAt: { gte: from, lt: to } },
					_sum: { amountChf: true },
					_count: { _all: true },
				}),
				this.db.payout.aggregate({
					where: { status: 'paid', paymentAt: { gte: from, lt: to } },
					_sum: { amountChf: true },
					_count: { _all: true },
				}),
				this.db.contributor.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.campaign.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.program.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.recipient.count({ where: { createdAt: { gte: from, lt: to } } }),
				this.db.recipient.findMany({
					include: {
						payouts: { select: { status: true } },
						program: {
							select: { programDurationInMonths: true, payoutInterval: true, country: { select: { isoCode: true } } },
						},
						localPartner: { select: { name: true } },
					},
				}),
			]);

			const emptyStats = (): SummaryStats => ({
				recipients: { active: 0, former: 0, suspended: 0, future: 0 },
				candidates: 0,
				payouts: { total: 0, confirmed: 0, contested: 0, failed: 0 },
			});
			const overall = emptyStats();
			const countries = new Map<string, SummaryStats>();
			const localPartners = new Map<
				string,
				{ stats: SummaryStats; countryIsoCodes: Set<string>; programIds: Set<string> }
			>();
			const addRecord = (stats: SummaryStats, record: (typeof recipientRecords)[number]) => {
				if (record.programId === null) {
					stats.candidates++;
				} else {
					const statusResult = this.recipientStatusService.getRecipientLifecycleStatus({
						startDate: record.startDate,
						suspendedAt: record.suspendedAt,
						paidOrConfirmedCount: record.payouts.filter(
							(payout) => payout.status === 'paid' || payout.status === 'confirmed',
						).length,
						programDurationInMonths: record.program?.programDurationInMonths ?? 0,
						payoutInterval: record.program?.payoutInterval ?? 'monthly',
						nowDate: now,
					});
					if (statusResult.success) {
						const status = statusResult.data === 'completed' ? 'former' : statusResult.data;
						stats.recipients[status]++;
					}
				}
				for (const payout of record.payouts) {
					if (payout.status === 'paid' || payout.status === 'confirmed') {
						stats.payouts.total++;
					}
					if (payout.status === 'confirmed') {
						stats.payouts.confirmed++;
					}
					if (payout.status === 'contested') {
						stats.payouts.contested++;
					}
					if (payout.status === 'failed') {
						stats.payouts.failed++;
					}
				}
			};
			for (const record of recipientRecords) {
				addRecord(overall, record);
				const countryIsoCode = record.program?.country.isoCode;
				if (countryIsoCode) {
					if (!countries.has(countryIsoCode)) {
						countries.set(countryIsoCode, emptyStats());
					}
					addRecord(countries.get(countryIsoCode)!, record);
				}
				if (!localPartners.has(record.localPartner.name)) {
					localPartners.set(record.localPartner.name, {
						stats: emptyStats(),
						countryIsoCodes: new Set(),
						programIds: new Set(),
					});
				}
				const partner = localPartners.get(record.localPartner.name)!;
				addRecord(partner.stats, record);
				if (countryIsoCode) {
					partner.countryIsoCodes.add(countryIsoCode);
				}
				if (record.programId) {
					partner.programIds.add(record.programId);
				}
			}

			return this.resultOk({
				period: { from, to },
				moneyIn: { amountChf: Number(contributions._sum.amountChf ?? 0), count: contributions._count._all },
				moneyOut: { amountChf: Number(payouts._sum.amountChf ?? 0), count: payouts._count._all },
				new: { contributors, campaigns, programs, recipients },
				stats: {
					overall,
					countries: Object.fromEntries(countries),
					localPartners: [...localPartners.entries()].map(([name, partner]) => ({
						name,
						countryIsoCodes: [...partner.countryIsoCodes],
						programs: partner.programIds.size,
						stats: partner.stats,
					})),
				},
			});
		} catch (error) {
			return this.resultFail(`Unable to load monthly summary: ${String(error)}`);
		}
	}
}

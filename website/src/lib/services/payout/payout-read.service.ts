import { PayoutStatus, Prisma, ProgramPermission } from '@/generated/prisma/client';
import { now } from '@/lib/utils/now';
import { toSortKey } from '@/lib/utils/to-sort-key';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ExchangeRateReadService } from '../exchange-rate/exchange-rate-read.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { ProgramStatsService } from '../program-stats/program-stats.service';
import {
	OngoingPayoutPaginatedTableView,
	OngoingPayoutTableQuery,
	OngoingPayoutTableViewRow,
	PayoutConfirmationPaginatedTableView,
	PayoutConfirmationTableQuery,
	PayoutConfirmationTableViewRow,
	PayoutEntity,
	PayoutForecastPaginatedTableView,
	PayoutForecastTableQuery,
	PayoutForecastTableView,
	PayoutForecastTableViewRow,
	PayoutMonth,
	PayoutPaginatedTableView,
	PayoutPayload,
	PayoutTableQuery,
	PayoutTableViewRow,
} from './payout.types';

export class PayoutReadService extends BaseService {
	private programAccessService = new ProgramAccessReadService();
	private exchangeRateService = new ExchangeRateReadService();
	private programStatsService = new ProgramStatsService();

	private buildPayoutOrderBy(query: PayoutTableQuery): Prisma.PayoutOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'recipient', 'programName', 'amount', 'status', 'paymentAt'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'recipient':
				return [{ recipient: { contact: { firstName: direction } } }, { recipient: { contact: { lastName: direction } } }];
			case 'programName':
				return [{ recipient: { program: { name: direction } } }];
			case 'amount':
				return [{ amount: direction }];
			case 'status':
				return [{ status: direction }];
			case 'paymentAt':
				return [{ paymentAt: direction }];
			default:
				return [{ paymentAt: 'desc' }];
		}
	}

	private buildOngoingPayoutOrderBy(query: OngoingPayoutTableQuery): Prisma.RecipientOrderByWithRelationInput[] {
		const direction: Prisma.SortOrder = query.sortDirection === 'asc' ? 'asc' : 'desc';
		const sortBy = toSortKey(query.sortBy, ['id', 'recipient', 'programName'] as const);
		switch (sortBy) {
			case 'id':
				return [{ id: direction }];
			case 'recipient':
				return [{ contact: { firstName: direction } }, { contact: { lastName: direction } }];
			case 'programName':
				return [{ program: { name: direction } }];
			default:
				return [{ createdAt: 'desc' }];
		}
	}

	private sortPayoutForecastRows(rows: PayoutForecastTableViewRow[], query: PayoutForecastTableQuery): PayoutForecastTableViewRow[] {
		const direction = query.sortDirection === 'asc' ? 1 : -1;
		const sortedRows = [...rows];
		const sortBy = toSortKey(query.sortBy, ['period', 'numberOfRecipients', 'amountInProgramCurrency', 'amountUsd'] as const);
		sortedRows.sort((a, b) => {
			switch (sortBy) {
				case 'period':
					return a.period.localeCompare(b.period) * direction;
				case 'numberOfRecipients':
					return (a.numberOfRecipients - b.numberOfRecipients) * direction;
				case 'amountInProgramCurrency':
					return (a.amountInProgramCurrency - b.amountInProgramCurrency) * direction;
				case 'amountUsd':
					return (a.amountUsd - b.amountUsd) * direction;
				default:
					return a.period.localeCompare(b.period);
			}
		});
		return sortedRows;
	}

	private getMonthIntervals() {
		const nowDate = now();

		return {
			current: { start: startOfMonth(nowDate), end: endOfMonth(nowDate) },
			last: { start: startOfMonth(subMonths(nowDate, 1)), end: endOfMonth(subMonths(nowDate, 1)) },
			twoAgo: { start: startOfMonth(subMonths(nowDate, 2)), end: endOfMonth(subMonths(nowDate, 2)) },
		};
	}

	async getPaginatedTableView(
		userId: string,
		query: PayoutTableQuery,
	): Promise<ServiceResult<PayoutPaginatedTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [], statusFilterOptions: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const selectedProgramId = query.programId?.trim() || undefined;
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			const statusValues = Object.values(PayoutStatus);
			const selectedStatus = statusValues.find((status) => status === query.payoutStatus);
			const statusFilterOptions = statusValues.map((status) => ({
				value: status,
				label: status.charAt(0).toUpperCase() + status.slice(1),
			}));
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions, statusFilterOptions });
			}
			const search = query.search.trim();
			const where = {
				recipient: {
					programId: { in: filteredProgramIds },
					...(search
						? {
								OR: [
									{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
									{ program: { name: { contains: search, mode: 'insensitive' as const } } },
								],
							}
						: {}),
				},
				...(selectedStatus ? { status: selectedStatus } : {}),
			};

			const [payouts, totalCount] = await Promise.all([
				this.db.payout.findMany({
					where,
					select: {
						id: true,
						amount: true,
						currency: true,
						status: true,
						paymentAt: true,
						recipient: {
							select: {
								contact: { select: { firstName: true, lastName: true } },
								program: { select: { id: true, name: true } },
							},
						},
					},
					orderBy: this.buildPayoutOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.payout.count({ where }),
			]);

			const tableRows: PayoutTableViewRow[] = payouts
				.filter((p) => p.recipient.program !== null)
				.map((payout) => {
					const programPermissions = accessiblePrograms
						.filter((x) => x.programId === payout.recipient.program!.id)
						.map((x) => x.permission);

					const permission = programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;

					return {
						id: payout.id,
						recipientFirstName: payout.recipient.contact.firstName,
						recipientLastName: payout.recipient.contact.lastName,
						programName: payout.recipient.program!.name,
						amount: Number(payout.amount),
						currency: payout.currency,
						status: payout.status,
						paymentAt: payout.paymentAt,
						permission,
					};
				});

			return this.resultOk({ tableRows, totalCount, programFilterOptions, statusFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payouts: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedOngoingPayoutTableView(
		userId: string,
		query: OngoingPayoutTableQuery,
	): Promise<ServiceResult<OngoingPayoutPaginatedTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const selectedProgramId = query.programId?.trim() || undefined;
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
			}
			const search = query.search.trim();
			const months = this.getMonthIntervals();
			const where = {
				programId: { in: filteredProgramIds },
				...(search
					? {
							OR: [
								{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
								{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
								{ program: { name: { contains: search, mode: 'insensitive' as const } } },
							],
						}
					: {}),
			};

			const [recipients, totalCount] = await Promise.all([
				this.db.recipient.findMany({
					where,
					select: {
						id: true,
						contact: { select: { firstName: true, lastName: true } },
						program: { select: { id: true, name: true, programDurationInMonths: true } },
						payouts: { select: { status: true, paymentAt: true } },
						createdAt: true,
					},
					orderBy: this.buildOngoingPayoutOrderBy(query),
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.recipient.count({ where }),
			]);

			const tableRows: OngoingPayoutTableViewRow[] = recipients
				.filter((r) => r.program !== null)
				.map((recipient) => {
					const programPermissions = accessiblePrograms
						.filter((p) => p.programId === recipient.program!.id)
						.map((p) => p.permission);

					const permission = programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;

					const payoutsReceived = recipient.payouts.length;
					const payoutsTotal = recipient.program!.programDurationInMonths ?? 0;
					const payoutsProgressPercent = payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0;

					const last3Months: PayoutMonth[] = [months.current, months.last, months.twoAgo].map(({ start, end }) => {
						const payout = recipient.payouts.find((p) => p.paymentAt >= start && p.paymentAt <= end);
						return {
							monthLabel: format(start, 'yyyy-MM'),
							status: payout?.status ?? null,
						};
					});

					return {
						id: recipient.id,
						firstName: recipient.contact.firstName,
						lastName: recipient.contact.lastName,
						programName: recipient.program!.name,
						payoutsReceived,
						payoutsTotal,
						payoutsProgressPercent,
						last3Months,
						createdAt: recipient.createdAt,
						permission,
					};
				});

			return this.resultOk({ tableRows, totalCount, programFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch ongoing payouts: ${JSON.stringify(error)}`);
		}
	}

	async getForecastTableView(
		userId: string,
		programId: string,
		monthsAhead: number,
	): Promise<ServiceResult<PayoutForecastTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const hasAccess = accessResult.data.some((p) => p.programId === programId);
			if (!hasAccess) {
				return this.resultFail('Access denied for this program');
			}

			const program = await this.db.program.findUnique({
				where: { id: programId },
				select: {
					programDurationInMonths: true,
					payoutPerInterval: true,
					payoutInterval: true,
					country: {
						select: {
							currency: true,
						},
					},
					recipients: {
						select: {
							startDate: true,
							suspendedAt: true,
							payouts: {
								where: { status: { in: [PayoutStatus.paid, PayoutStatus.confirmed] } },
								select: { id: true },
							},
						},
					},
				},
			});

			if (!program) {
				return this.resultFail('Program not found');
			}

			const forecastMonths = Array.from({ length: monthsAhead + 1 }, (_, i) => {
				const start = startOfMonth(addMonths(now(), i));
				return format(start, 'yyyy-MM');
			});

			const recipientCountByMonth = new Map<string, number>();
			for (const m of forecastMonths) {
				recipientCountByMonth.set(m, 0);
			}

			for (const recipient of program.recipients) {
				const paid = recipient.payouts.length;
				const isEligibleNow = this.programStatsService.isRecipientEligibleForPayout({
					startDate: recipient.startDate,
					suspendedAt: recipient.suspendedAt,
					paidOrConfirmedCount: paid,
					programDurationInMonths: program.programDurationInMonths,
					payoutInterval: program.payoutInterval,
					nowDate: now(),
				});
				if (!isEligibleNow) {
					continue;
				}
				const remaining = Math.max(0, program.programDurationInMonths - paid);
				for (let i = 0; i < remaining && i < forecastMonths.length; i++) {
					const monthLabel = forecastMonths[i];
					recipientCountByMonth.set(monthLabel, (recipientCountByMonth.get(monthLabel) ?? 0) + 1);
				}
			}

			const exchangeRateResult = await this.exchangeRateService.getLatestRates();
			if (!exchangeRateResult.success) {
				return this.resultFail(exchangeRateResult.error);
			}

			const baseRate = exchangeRateResult.data[program.country.currency];
			const usdRate = exchangeRateResult.data.USD;

			if (!baseRate || !usdRate) {
				return this.resultFail('Missing exchange rate');
			}

			const payoutPerIntervalUsd = (Number(program.payoutPerInterval) / baseRate) * usdRate;

			const tableRows: PayoutForecastTableViewRow[] = forecastMonths.map((label) => {
				const count = recipientCountByMonth.get(label) ?? 0;

				return {
					period: label,
					numberOfRecipients: count,
					amountInProgramCurrency: Number(program.payoutPerInterval) * count,
					amountUsd: payoutPerIntervalUsd * count,
					programCurrency: program.country.currency,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not generate payout forecast: ${JSON.stringify(error)}`);
		}
	}

	async getPaginatedForecastTableView(
		userId: string,
		programId: string,
		monthsAhead: number,
		query: PayoutForecastTableQuery,
	): Promise<ServiceResult<PayoutForecastPaginatedTableView>> {
		const base = await this.getForecastTableView(userId, programId, monthsAhead);
		if (!base.success) {
			return this.resultFail(base.error);
		}

		const search = query.search.trim().toLowerCase();
		const filteredRows = search
			? base.data.tableRows.filter((row) => {
					return (
						row.period.toLowerCase().includes(search) ||
						String(row.numberOfRecipients).includes(search) ||
						String(row.amountInProgramCurrency).includes(search) ||
						String(row.amountUsd).includes(search)
					);
				})
			: base.data.tableRows;

		const sortedRows = this.sortPayoutForecastRows(filteredRows, query);
		const offset = (query.page - 1) * query.pageSize;
		const tableRows = sortedRows.slice(offset, offset + query.pageSize);

		return this.resultOk({
			tableRows,
			totalCount: sortedRows.length,
		});
	}

	async getPaginatedPayoutConfirmationTableView(
		userId: string,
		query: PayoutConfirmationTableQuery,
	): Promise<ServiceResult<PayoutConfirmationPaginatedTableView>> {
		try {
			const accessResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return this.resultFail(accessResult.error);
			}

			const accessiblePrograms = accessResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [], statusFilterOptions: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const selectedProgramId = query.programId?.trim() || undefined;
			const filteredProgramIds = selectedProgramId ? programIds.filter((id) => id === selectedProgramId) : programIds;
			const statusValues = Object.values(PayoutStatus);
			const selectedStatus = statusValues.find((status) => status === query.payoutStatus);
			const statusFilterOptions = statusValues.map((status) => ({
				value: status,
				label: status.charAt(0).toUpperCase() + status.slice(1),
			}));
			const programFilterOptions = Array.from(
				new Map(accessiblePrograms.map((p) => [p.programId, { id: p.programId, name: p.programName }])).values(),
			);
			if (selectedProgramId && filteredProgramIds.length === 0) {
				return this.resultOk({ tableRows: [], totalCount: 0, programFilterOptions, statusFilterOptions });
			}
			const search = query.search.trim();
			const where = {
				recipient: {
					programId: { in: filteredProgramIds },
					...(search
						? {
								OR: [
									{ contact: { firstName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { lastName: { contains: search, mode: 'insensitive' as const } } },
									{ contact: { email: { contains: search, mode: 'insensitive' as const } } },
									{ program: { name: { contains: search, mode: 'insensitive' as const } } },
								],
							}
						: {}),
				},
				...(selectedStatus ? { status: selectedStatus } : {}),
			};

			const [payouts, totalCount] = await Promise.all([
				this.db.payout.findMany({
					where,
					select: {
						id: true,
						amount: true,
						currency: true,
						status: true,
						paymentAt: true,
						phoneNumber: true,
						recipient: {
							select: {
								contact: { select: { firstName: true, lastName: true } },
								program: { select: { id: true, name: true } },
							},
						},
					},
					orderBy: { paymentAt: 'desc' },
					skip: (query.page - 1) * query.pageSize,
					take: query.pageSize,
				}),
				this.db.payout.count({ where }),
			]);

			const tableRows: PayoutConfirmationTableViewRow[] = payouts
				.filter((p) => p.recipient.program !== null)
				.map((payout) => {
					const programPermissions = accessiblePrograms
						.filter((p) => p.programId === payout.recipient.program!.id)
						.map((p) => p.permission);

					const permission = programPermissions.includes(ProgramPermission.operator)
						? ProgramPermission.operator
						: ProgramPermission.owner;

					return {
						id: payout.id,
						recipientFirstName: payout.recipient.contact.firstName,
						recipientLastName: payout.recipient.contact.lastName,
						programName: payout.recipient.program!.name,
						amount: Number(payout.amount),
						currency: payout.currency,
						status: payout.status,
						paymentAt: payout.paymentAt,
						phoneNumber: payout.phoneNumber,
						permission,
					};
				});

			return this.resultOk({ tableRows, totalCount, programFilterOptions, statusFilterOptions });
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payout confirmation inbox: ${JSON.stringify(error)}`);
		}
	}

	async get(userId: string, payoutId: string): Promise<ServiceResult<PayoutPayload>> {
		const payout = await this.db.payout.findUnique({
			where: { id: payoutId },
			select: {
				id: true,
				amount: true,
				currency: true,
				status: true,
				paymentAt: true,
				phoneNumber: true,
				comments: true,
				recipient: {
					select: {
						id: true,
						contact: { select: { firstName: true, lastName: true } },
						program: { select: { id: true, name: true } },
					},
				},
			},
		});

		if (!payout) {
			return this.resultFail('Payout not found');
		}

		if (payout.recipient.program) {
			const access = await this.programAccessService.getAccessiblePrograms(userId);
			if (!access.success) {
				return this.resultFail(access.error);
			}

			const allowed = access.data.some((p) => p.programId === payout.recipient.program!.id && p.permission != null);

			if (!allowed) {
				return this.resultFail('Access denied to this payout');
			}
		}

		return this.resultOk({
			id: payout.id,
			amount: Number(payout.amount),
			currency: payout.currency,
			status: payout.status,
			paymentAt: payout.paymentAt,
			phoneNumber: payout.phoneNumber,
			comments: payout.comments,
			recipient: {
				id: payout.recipient.id,
				firstName: payout.recipient.contact.firstName,
				lastName: payout.recipient.contact.lastName,
				programId: payout.recipient.program && payout.recipient.program.id,
				programName: payout.recipient.program && payout.recipient.program.name,
			},
		});
	}

	async getByRecipientId(recipientId: string): Promise<ServiceResult<PayoutEntity[]>> {
		try {
			const payouts = await this.db.payout.findMany({
				where: { recipientId },
				orderBy: { paymentAt: 'desc' },
			});
			return this.resultOk(payouts);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payouts: ${JSON.stringify(error)}`);
		}
	}

	async getByRecipientAndId(recipientId: string, payoutId: string): Promise<ServiceResult<PayoutEntity | null>> {
		if (!recipientId || !payoutId) {
			return this.resultFail('Recipient ID and Payout ID are required');
		}

		try {
			const payout = await this.db.payout.findFirst({
				where: { id: payoutId, recipientId },
			});

			return this.resultOk(payout);
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Could not fetch payout "${payoutId}": ${JSON.stringify(error)}`);
		}
	}
}

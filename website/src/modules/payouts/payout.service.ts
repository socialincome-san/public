import { PayoutStatus, ProgramPermission } from '@/generated/prisma/enums';
import { resultFail, resultOk, type ServiceResult } from '@/lib/service-result';
import { isValidCountryCode } from '@/lib/types/country';
import { now } from '@/lib/utils/now';
import { getLatestRates } from '@/modules/exchange-rates/exchange-rate.service';
import { getLocalPartnerIdBySlug } from '@/modules/local-partners/local-partner.service';
import { getAccessiblePrograms } from '@/modules/program-access/program-access.service';
import type { ProgramAccesses } from '@/modules/program-access/program-access.types';
import { getProgramPayoutForecastSource } from '@/modules/programs/program-reference.service';
import { getRecipientProgramAssignment, recipientStatusService } from '@/modules/recipients/recipient.service';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { canReadPayout, canWritePayout } from './payout.permissions';
import * as payoutRepository from './payout.repository';
import { payoutCreateSchema, payoutUpdateSchema, type CreatePayoutInput, type UpdatePayoutInput } from './payout.schemas';
import type {
	CountryPayoutTotals,
	OngoingPayoutPaginatedTableView,
	OngoingPayoutTableQuery,
	OngoingPayoutTableViewRow,
	PayoutConfirmationPaginatedTableView,
	PayoutConfirmationTableQuery,
	PayoutConfirmationTableViewRow,
	PayoutDateRange,
	PayoutForecastPaginatedTableView,
	PayoutForecastTableQuery,
	PayoutForecastTableView,
	PayoutForecastTableViewRow,
	PayoutMonth,
	PayoutPaginatedTableView,
	PayoutPayload,
	PayoutProcessCreateInput,
	PayoutProcessCreateSummary,
	PayoutRecord,
	PayoutSummary,
	PayoutTableQuery,
	PayoutTableViewRow,
} from './payout.types';

export const getPaidOrConfirmedPayoutTotal = async (dateRange?: PayoutDateRange): Promise<ServiceResult<number>> => {
	try {
		const aggregate = await payoutRepository.findPaidOrConfirmedPayoutTotal(dateRange);

		return resultOk(Number(aggregate._sum.amountChf ?? 0));
	} catch (error) {
		console.error('Could not fetch paid or confirmed payout total', { error });

		return resultFail('Could not fetch payout total');
	}
};

export const getPaidPayoutSummary = async (dateRange: PayoutDateRange): Promise<ServiceResult<PayoutSummary>> => {
	try {
		const aggregate = await payoutRepository.findPaidPayoutSummary(dateRange);

		return resultOk({
			amountChf: Number(aggregate._sum.amountChf ?? 0),
			count: aggregate._count._all,
		});
	} catch (error) {
		console.error('Could not fetch paid payout summary', { error });

		return resultFail('Could not fetch payout summary');
	}
};

export const getPayoutTotalsForCountry = async (isoCode: string): Promise<ServiceResult<CountryPayoutTotals>> => {
	const normalizedIsoCode = isoCode.trim().toUpperCase();
	if (!normalizedIsoCode) {
		return resultFail('Missing isoCode');
	}
	if (!isValidCountryCode(normalizedIsoCode)) {
		return resultFail('Invalid country code');
	}

	try {
		const aggregate = await payoutRepository.findPayoutTotalForCountry(normalizedIsoCode);

		return resultOk({ totalPayoutsChf: Number(aggregate._sum?.amountChf ?? 0) });
	} catch (error) {
		console.error('Could not fetch payout totals for country', { isoCode: normalizedIsoCode, error });

		return resultFail('Could not fetch payout totals for country');
	}
};

export const getPayoutTotalsForLocalPartnerSlug = async (
	localPartnerSlug: string,
): Promise<ServiceResult<CountryPayoutTotals>> => {
	const normalizedSlug = localPartnerSlug.trim();
	if (!normalizedSlug) {
		return resultFail('Missing local partner slug');
	}

	try {
		const localPartnerResult = await getLocalPartnerIdBySlug(normalizedSlug);
		if (!localPartnerResult.success) {
			return resultFail(localPartnerResult.error);
		}

		const aggregate = await payoutRepository.findPayoutTotalForLocalPartner(localPartnerResult.data);

		return resultOk({ totalPayoutsChf: Number(aggregate._sum.amountChf ?? 0) });
	} catch (error) {
		console.error('Could not fetch payout totals for local partner', { localPartnerSlug: normalizedSlug, error });

		return resultFail('Could not fetch payout totals for local partner');
	}
};

export const getPaginatedPayoutTableView = async (
	userId: string,
	query: PayoutTableQuery,
): Promise<ServiceResult<PayoutPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const accessiblePrograms = getOperatorPrograms(accessResult.data);
		if (accessiblePrograms.length === 0) {
			return resultOk(emptyPayoutTableView());
		}

		const programIds = accessiblePrograms.map(({ programId }) => programId);
		const programFilterOptions = getProgramFilterOptions(accessiblePrograms);
		const selectedProgramId = normalizeOptionalFilter(query.programId);
		const filteredProgramIds = selectedProgramId
			? programIds.filter((programId) => programId === selectedProgramId)
			: programIds;
		const mobileMoneyProviderFilterOptions = await payoutRepository.findPayoutMobileMoneyProviderOptions(programIds);
		const selectedMobileMoneyProviderId = normalizeOptionalFilter(query.mobileMoneyProviderId);
		const statusValues = Object.values(PayoutStatus);
		const selectedStatus = statusValues.find((status) => status === query.payoutStatus);
		const statusFilterOptions = statusValues.map((status) => ({
			value: status,
			label: `${status.charAt(0).toUpperCase()}${status.slice(1)}`,
		}));
		const baseResult = {
			tableRows: [],
			totalCount: 0,
			programFilterOptions,
			statusFilterOptions,
			mobileMoneyProviderFilterOptions,
		};

		if (selectedProgramId && filteredProgramIds.length === 0) {
			return resultOk(baseResult);
		}
		if (
			selectedMobileMoneyProviderId &&
			!mobileMoneyProviderFilterOptions.some(({ id }) => id === selectedMobileMoneyProviderId)
		) {
			return resultOk(baseResult);
		}

		const { payouts, totalCount } = await payoutRepository.findPayoutTableSource({
			programIds: filteredProgramIds,
			mobileMoneyProviderId: selectedMobileMoneyProviderId,
			status: selectedStatus,
			query,
		});
		const tableRows: PayoutTableViewRow[] = payouts.flatMap((payout) => {
			if (!payout.recipient.program) {
				return [];
			}

			return [
				{
					id: payout.id,
					recipientFirstName: payout.recipient.contact.firstName,
					recipientLastName: payout.recipient.contact.lastName,
					programName: payout.recipient.program.name,
					mobileMoneyProviderName: payout.recipient.paymentInformation?.mobileMoneyProvider?.name ?? null,
					amount: Number(payout.amount),
					currency: payout.currency,
					status: payout.status,
					paymentAt: payout.paymentAt,
				},
			];
		});

		return resultOk({
			tableRows,
			totalCount,
			programFilterOptions,
			statusFilterOptions,
			mobileMoneyProviderFilterOptions,
		});
	} catch (error) {
		console.error('Could not fetch payouts', { userId, error });

		return resultFail('Could not fetch payouts');
	}
};

export const getPaginatedOngoingPayoutTableView = async (
	userId: string,
	query: OngoingPayoutTableQuery,
): Promise<ServiceResult<OngoingPayoutPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const accessiblePrograms = getOperatorPrograms(accessResult.data);
		if (accessiblePrograms.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, programFilterOptions: [] });
		}

		const programIds = accessiblePrograms.map(({ programId }) => programId);
		const programFilterOptions = getProgramFilterOptions(accessiblePrograms);
		const selectedProgramId = normalizeOptionalFilter(query.programId);
		const filteredProgramIds = selectedProgramId
			? programIds.filter((programId) => programId === selectedProgramId)
			: programIds;
		if (selectedProgramId && filteredProgramIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, programFilterOptions });
		}

		const { recipients, totalCount } = await payoutRepository.findOngoingPayoutTableSource({
			programIds: filteredProgramIds,
			query,
		});
		const months = getMonthIntervals();
		const tableRows: OngoingPayoutTableViewRow[] = recipients.flatMap((recipient) => {
			if (!recipient.program) {
				return [];
			}

			const payoutsReceived = recipient.payouts.length;
			const payoutsTotal = recipient.program.programDurationInMonths ?? 0;
			const last3Months: PayoutMonth[] = [months.current, months.last, months.twoAgo].map(({ start, end }) => {
				const payout = recipient.payouts.find((candidate) => candidate.paymentAt >= start && candidate.paymentAt <= end);

				return { monthLabel: format(start, 'yyyy-MM'), status: payout?.status ?? null };
			});

			return [
				{
					id: recipient.id,
					firstName: recipient.contact.firstName,
					lastName: recipient.contact.lastName,
					programName: recipient.program.name,
					payoutsReceived,
					payoutsTotal,
					payoutsProgressPercent: payoutsTotal > 0 ? Math.round((payoutsReceived / payoutsTotal) * 100) : 0,
					last3Months,
					createdAt: recipient.createdAt,
					permission: ProgramPermission.operator,
				},
			];
		});

		return resultOk({ tableRows, totalCount, programFilterOptions });
	} catch (error) {
		console.error('Could not fetch ongoing payouts', { userId, error });

		return resultFail('Could not fetch ongoing payouts');
	}
};

export const getPublicPayoutForecastTableView = async (
	programId: string,
	monthsAhead: number,
): Promise<ServiceResult<PayoutForecastTableView>> => buildPayoutForecastTableView(programId, monthsAhead);

export const getPayoutForecastTableView = async (
	userId: string,
	programId: string,
	monthsAhead: number,
): Promise<ServiceResult<PayoutForecastTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canReadPayout(accessResult.data, programId)) {
			return resultFail('Access denied for this program');
		}

		return buildPayoutForecastTableView(programId, monthsAhead);
	} catch (error) {
		console.error('Could not generate payout forecast', { userId, programId, error });

		return resultFail('Could not generate payout forecast');
	}
};

export const getPaginatedPayoutForecastTableView = async (
	userId: string,
	programId: string,
	monthsAhead: number,
	query: PayoutForecastTableQuery,
): Promise<ServiceResult<PayoutForecastPaginatedTableView>> => {
	const forecastResult = await getPayoutForecastTableView(userId, programId, monthsAhead);
	if (!forecastResult.success) {
		return resultFail(forecastResult.error);
	}

	const search = query.search.trim().toLowerCase();
	const filteredRows = search
		? forecastResult.data.tableRows.filter(
				(row) =>
					row.period.toLowerCase().includes(search) ||
					String(row.numberOfRecipients).includes(search) ||
					String(row.amountInProgramCurrency).includes(search) ||
					String(row.amountUsd).includes(search),
			)
		: forecastResult.data.tableRows;
	const sortedRows = sortPayoutForecastRows(filteredRows, query);
	const offset = (query.page - 1) * query.pageSize;

	return resultOk({
		tableRows: sortedRows.slice(offset, offset + query.pageSize),
		totalCount: sortedRows.length,
	});
};

export const getPaginatedPayoutConfirmationTableView = async (
	userId: string,
	query: PayoutConfirmationTableQuery,
): Promise<ServiceResult<PayoutConfirmationPaginatedTableView>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const accessiblePrograms = getOperatorPrograms(accessResult.data);
		if (accessiblePrograms.length === 0) {
			return resultOk({
				tableRows: [],
				totalCount: 0,
				programFilterOptions: [],
				statusFilterOptions: [],
			});
		}

		const programIds = accessiblePrograms.map(({ programId }) => programId);
		const programFilterOptions = getProgramFilterOptions(accessiblePrograms);
		const selectedProgramId = normalizeOptionalFilter(query.programId);
		const filteredProgramIds = selectedProgramId
			? programIds.filter((programId) => programId === selectedProgramId)
			: programIds;
		const statusFilterOptions: { value: string; label: string }[] = [];
		if (selectedProgramId && filteredProgramIds.length === 0) {
			return resultOk({ tableRows: [], totalCount: 0, programFilterOptions, statusFilterOptions });
		}

		const { payouts, totalCount } = await payoutRepository.findPayoutConfirmationTableSource({
			programIds: filteredProgramIds,
			query,
		});
		const tableRows: PayoutConfirmationTableViewRow[] = payouts.flatMap((payout) => {
			if (!payout.recipient.program) {
				return [];
			}

			return [
				{
					id: payout.id,
					recipientFirstName: payout.recipient.contact.firstName,
					recipientLastName: payout.recipient.contact.lastName,
					programName: payout.recipient.program.name,
					amount: Number(payout.amount),
					currency: payout.currency,
					status: payout.status,
					paymentAt: payout.paymentAt,
					phoneNumber: payout.phoneNumber,
				},
			];
		});

		return resultOk({ tableRows, totalCount, programFilterOptions, statusFilterOptions });
	} catch (error) {
		console.error('Could not fetch payout confirmation inbox', { userId, error });

		return resultFail('Could not fetch payout confirmation inbox');
	}
};

export const getPayout = async (userId: string, payoutId: string): Promise<ServiceResult<PayoutPayload>> => {
	try {
		const payout = await payoutRepository.findPayout(payoutId);
		if (!payout) {
			return resultFail('Payout not found');
		}

		if (payout.recipient.program) {
			const accessResult = await getAccessiblePrograms(userId);
			if (!accessResult.success) {
				return resultFail(accessResult.error);
			}
			if (!canWritePayout(accessResult.data, payout.recipient.program.id)) {
				return resultFail('Access denied to this payout');
			}
		}

		return resultOk(toPayoutPayload(payout));
	} catch (error) {
		console.error('Could not fetch payout', { userId, payoutId, error });

		return resultFail('Could not fetch payout');
	}
};

export const getPayoutsByRecipientId = async (recipientId: string): Promise<ServiceResult<PayoutRecord[]>> => {
	try {
		const payouts = await payoutRepository.findPayoutsByRecipientId(recipientId);

		return resultOk(payouts.map(toPayoutRecord));
	} catch (error) {
		console.error('Could not fetch payouts for recipient', { recipientId, error });

		return resultFail('Could not fetch payouts');
	}
};

export const getPayoutByRecipientAndId = async (
	recipientId: string,
	payoutId: string,
): Promise<ServiceResult<PayoutRecord | null>> => {
	if (!recipientId || !payoutId) {
		return resultFail('Recipient ID and Payout ID are required');
	}

	try {
		const payout = await payoutRepository.findPayoutByRecipientAndId(recipientId, payoutId);

		return resultOk(payout ? toPayoutRecord(payout) : null);
	} catch (error) {
		console.error('Could not fetch recipient payout', { recipientId, payoutId, error });

		return resultFail(`Could not fetch payout "${payoutId}"`);
	}
};

export const createPayoutProcessPayouts = async (
	userId: string,
	inputs: PayoutProcessCreateInput[],
	selectedDate: Date,
): Promise<ServiceResult<PayoutProcessCreateSummary>> => {
	if (inputs.length === 0) {
		return resultOk({ createdCount: 0, skippedCount: 0 });
	}

	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const recipientIds = Array.from(new Set(inputs.map(({ recipientId }) => recipientId)));
		const recipientPrograms = await payoutRepository.findPayoutProcessRecipientPrograms(recipientIds);
		if (recipientPrograms.length !== recipientIds.length) {
			return resultFail('One or more payout recipients were not found');
		}
		if (recipientPrograms.some(({ programId }) => !programId || !canWritePayout(accessResult.data, programId))) {
			return resultFail('Access denied for one or more payout recipients');
		}

		const monthStart = startOfMonth(selectedDate);
		const monthEnd = endOfMonth(selectedDate);
		const existingPayouts = await payoutRepository.findExistingPayoutProcessRecipientIds(recipientIds, monthStart, monthEnd);
		const existingRecipientIds = new Set(existingPayouts.map(({ recipientId }) => recipientId));
		const toCreate = inputs.filter(({ recipientId }) => !existingRecipientIds.has(recipientId));
		if (toCreate.length > 0) {
			await payoutRepository.createPayoutProcessPayouts(toCreate);
		}

		return resultOk({
			createdCount: toCreate.length,
			skippedCount: inputs.length - toCreate.length,
		});
	} catch (error) {
		console.error('Could not generate payouts', { userId, error });

		return resultFail('Could not generate payouts');
	}
};

export const updatePayoutStatus = async (
	userId: string,
	payoutId: string,
	newStatus: PayoutStatus,
): Promise<ServiceResult<string>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const payout = await payoutRepository.findPayoutForStatusUpdate(payoutId);
		if (!payout) {
			return resultFail('Payout not found');
		}
		if (!payout.recipient.programId) {
			return resultFail('Recipient is not assigned to a program');
		}
		if (!canWritePayout(accessResult.data, payout.recipient.programId)) {
			return resultFail('Access denied for this payout');
		}
		if (payout.status !== PayoutStatus.paid) {
			return resultFail('Only payouts with status "paid" can be updated');
		}

		await payoutRepository.updatePayoutStatus(payoutId, newStatus);

		return resultOk(`Payout updated to "${newStatus}"`);
	} catch (error) {
		console.error('Could not update payout status', { userId, payoutId, newStatus, error });

		return resultFail('Could not update payout');
	}
};

export const createPayout = async (userId: string, input: CreatePayoutInput): Promise<ServiceResult<PayoutPayload>> => {
	const inputResult = payoutCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	try {
		const recipientResult = await getRecipientProgramAssignment(inputResult.data.recipientId);
		if (!recipientResult.success) {
			return resultFail(recipientResult.error);
		}
		if (!recipientResult.data) {
			return resultFail('Recipient not found');
		}
		if (!recipientResult.data.programId) {
			return resultFail('Recipient is not assigned to a program');
		}

		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canWritePayout(accessResult.data, recipientResult.data.programId)) {
			return resultFail('No edit access for this program');
		}

		return resultOk(toPayoutPayload(await payoutRepository.createPayout(inputResult.data)));
	} catch (error) {
		console.error('Could not create payout', { userId, error });

		return resultFail('Could not create payout');
	}
};

export const updatePayout = async (userId: string, input: UpdatePayoutInput): Promise<ServiceResult<PayoutPayload>> => {
	const inputResult = payoutUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	try {
		const existing = await payoutRepository.findPayoutForUpdate(inputResult.data.id);
		if (!existing) {
			return resultFail('Payout not found');
		}
		if (!existing.recipient.programId) {
			return resultFail('Recipient is not assigned to a program');
		}

		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}
		if (!canWritePayout(accessResult.data, existing.recipient.programId)) {
			return resultFail('No edit permission for this payout');
		}

		const recipientResult = await getRecipientProgramAssignment(inputResult.data.recipientId);
		if (!recipientResult.success) {
			return resultFail(recipientResult.error);
		}
		if (!recipientResult.data) {
			return resultFail('Recipient not found');
		}
		if (!recipientResult.data.programId) {
			return resultFail('Recipient is not assigned to a program');
		}
		if (!canWritePayout(accessResult.data, recipientResult.data.programId)) {
			return resultFail('No edit access for selected recipient');
		}

		return resultOk(toPayoutPayload(await payoutRepository.updatePayout(inputResult.data)));
	} catch (error) {
		console.error('Could not update payout', { userId, payoutId: input.id, error });

		return resultFail('Could not update payout');
	}
};

export const deletePayout = async (userId: string, payoutId: string): Promise<ServiceResult<{ id: string }>> => {
	try {
		const accessResult = await getAccessiblePrograms(userId);
		if (!accessResult.success) {
			return resultFail(accessResult.error);
		}

		const existing = await payoutRepository.findPayoutForDeletion(payoutId);
		if (!existing) {
			return resultFail('Payout not found');
		}
		if (!existing.recipient.programId) {
			return resultFail('Recipient is not assigned to a program');
		}
		if (!canWritePayout(accessResult.data, existing.recipient.programId)) {
			return resultFail('No delete permission for this payout');
		}
		if (existing.status !== PayoutStatus.failed) {
			return resultFail('Only payouts with status "failed" can be deleted');
		}

		return resultOk(await payoutRepository.deletePayout(payoutId));
	} catch (error) {
		console.error('Could not delete payout', { userId, payoutId, error });

		return resultFail('Could not delete payout');
	}
};

export const updatePayoutStatusByRecipient = async (
	recipientId: string,
	payoutId: string,
	status: PayoutStatus,
	comments?: string | null,
): Promise<ServiceResult<PayoutRecord>> => {
	try {
		const payout = await payoutRepository.findPayoutForRecipientStatusUpdate(recipientId, payoutId);
		if (!payout) {
			return resultFail(`Payout "${payoutId}" not found for recipient`);
		}

		const updated = await payoutRepository.updatePayoutStatusByRecipient(payout.id, status, comments);

		return resultOk(toPayoutRecord(updated));
	} catch (error) {
		console.error('Failed to update recipient payout', { recipientId, payoutId, status, error });

		return resultFail(`Failed to update payout "${payoutId}"`);
	}
};

const buildPayoutForecastTableView = async (
	programId: string,
	monthsAhead: number,
): Promise<ServiceResult<PayoutForecastTableView>> => {
	try {
		const programResult = await getProgramPayoutForecastSource(programId);
		if (!programResult.success) {
			return resultFail(programResult.error);
		}

		const program = programResult.data;
		const forecastMonths = Array.from({ length: monthsAhead + 1 }, (_, index) =>
			format(startOfMonth(addMonths(now(), index)), 'yyyy-MM'),
		);
		const recipientCountByMonth = new Map(forecastMonths.map((month) => [month, 0]));

		for (const recipient of program.recipients) {
			const paid = recipient.payouts.length;
			const eligibilityResult = recipientStatusService.isRecipientEligibleForPayout({
				startDate: recipient.startDate,
				suspendedAt: recipient.suspendedAt,
				paidOrConfirmedCount: paid,
				programDurationInMonths: program.programDurationInMonths,
				payoutInterval: program.payoutInterval,
				nowDate: now(),
			});
			if (!eligibilityResult.success || !eligibilityResult.data) {
				continue;
			}

			const remaining = Math.max(0, program.programDurationInMonths - paid);
			for (let index = 0; index < remaining && index < forecastMonths.length; index += 1) {
				const month = forecastMonths[index];
				if (month) {
					recipientCountByMonth.set(month, (recipientCountByMonth.get(month) ?? 0) + 1);
				}
			}
		}

		const exchangeRateResult = await getLatestRates();
		if (!exchangeRateResult.success) {
			return resultFail(exchangeRateResult.error);
		}

		const baseRate = exchangeRateResult.data[program.country.currency];
		const usdRate = exchangeRateResult.data.USD;
		if (!baseRate || !usdRate) {
			return resultFail('Missing exchange rate');
		}

		const payoutPerIntervalUsd = (program.payoutPerInterval / baseRate) * usdRate;
		const tableRows: PayoutForecastTableViewRow[] = forecastMonths.map((period) => {
			const numberOfRecipients = recipientCountByMonth.get(period) ?? 0;

			return {
				period,
				numberOfRecipients,
				amountInProgramCurrency: program.payoutPerInterval * numberOfRecipients,
				amountUsd: payoutPerIntervalUsd * numberOfRecipients,
				programCurrency: program.country.currency,
			};
		});

		return resultOk({ tableRows });
	} catch (error) {
		console.error('Could not generate payout forecast', { programId, error });

		return resultFail('Could not generate payout forecast');
	}
};

const toPayoutPayload = (
	payout: Awaited<ReturnType<typeof payoutRepository.findPayout>> extends infer Payout ? NonNullable<Payout> : never,
): PayoutPayload => ({
	id: payout.id,
	amount: Number(payout.amount),
	amountChf: payout.amountChf === null ? null : Number(payout.amountChf),
	currency: payout.currency,
	status: payout.status,
	paymentAt: payout.paymentAt,
	phoneNumber: payout.phoneNumber,
	comments: payout.comments,
	recipient: {
		id: payout.recipient.id,
		firstName: payout.recipient.contact.firstName,
		lastName: payout.recipient.contact.lastName,
		programId: payout.recipient.program?.id ?? null,
		programName: payout.recipient.program?.name ?? null,
	},
});

const toPayoutRecord = (
	payout: Awaited<ReturnType<typeof payoutRepository.findPayoutByRecipientAndId>> extends infer Payout
		? NonNullable<Payout>
		: never,
): PayoutRecord => ({
	id: payout.id,
	legacyFirestoreId: payout.legacyFirestoreId,
	amount: String(payout.amount),
	amountChf: payout.amountChf === null ? null : String(payout.amountChf),
	currency: payout.currency,
	paymentAt: payout.paymentAt,
	status: payout.status,
	phoneNumber: payout.phoneNumber,
	comments: payout.comments,
	recipientId: payout.recipientId,
	createdAt: payout.createdAt,
	updatedAt: payout.updatedAt,
});

const getOperatorPrograms = (accesses: ProgramAccesses): ProgramAccesses =>
	accesses.filter(({ permission }) => permission === ProgramPermission.operator);

const getProgramFilterOptions = (accesses: ProgramAccesses): { id: string; name: string }[] =>
	Array.from(
		new Map(accesses.map(({ programId, programName }) => [programId, { id: programId, name: programName }])).values(),
	);

const emptyPayoutTableView = (): PayoutPaginatedTableView => ({
	tableRows: [],
	totalCount: 0,
	programFilterOptions: [],
	statusFilterOptions: [],
	mobileMoneyProviderFilterOptions: [],
});

const normalizeOptionalFilter = (value: string | undefined): string | undefined => {
	const normalizedValue = value?.trim();
	if (!normalizedValue) {
		return undefined;
	}

	return normalizedValue;
};

const getMonthIntervals = () => {
	const currentDate = now();
	const previousMonth = subMonths(currentDate, 1);
	const twoMonthsAgo = subMonths(currentDate, 2);

	return {
		current: { start: startOfMonth(currentDate), end: endOfMonth(currentDate) },
		last: { start: startOfMonth(previousMonth), end: endOfMonth(previousMonth) },
		twoAgo: { start: startOfMonth(twoMonthsAgo), end: endOfMonth(twoMonthsAgo) },
	};
};

const sortPayoutForecastRows = (
	rows: PayoutForecastTableViewRow[],
	query: PayoutForecastTableQuery,
): PayoutForecastTableViewRow[] => {
	const direction = query.sortDirection === 'asc' ? 1 : -1;
	const sortedRows = [...rows];

	sortedRows.sort((left, right) => {
		switch (query.sortBy) {
			case 'period':
				return left.period.localeCompare(right.period) * direction;
			case 'numberOfRecipients':
				return (left.numberOfRecipients - right.numberOfRecipients) * direction;
			case 'amountInProgramCurrency':
				return (left.amountInProgramCurrency - right.amountInProgramCurrency) * direction;
			case 'amountUsd':
				return (left.amountUsd - right.amountUsd) * direction;
			default:
				return left.period.localeCompare(right.period);
		}
	});

	return sortedRows;
};

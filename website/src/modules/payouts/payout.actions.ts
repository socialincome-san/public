'use server';

import { PayoutStatus } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail, type Result } from '@/lib/result';
import type { CountryPayoutTotals, PayoutForecastTableView, PayoutPayload } from '@/modules/payouts/payout.types';
import { getEditableRecipientOptions } from '@/modules/recipients/recipient.service';
import type { RecipientOption } from '@/modules/recipients/recipient.types';
import { revalidatePath } from 'next/cache';
import {
	payoutCountryCodeSchema,
	payoutCreateSchema,
	payoutIdSchema,
	payoutLocalPartnerSlugSchema,
	payoutNoInputSchema,
	payoutProgramIdSchema,
	payoutUpdateSchema,
} from './payout.schemas';
import {
	createPayout,
	deletePayout,
	getPayout,
	getPayoutTotalsForCountry,
	getPayoutTotalsForLocalPartnerSlug,
	getPublicPayoutForecastTableView,
	updatePayout,
	updatePayoutStatus,
} from './payout.service';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from './payout.types';

export const createPayoutAction = async (input: unknown): Promise<Result<PayoutPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await createPayout(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/delivery/payouts');

	return result;
};

export const updatePayoutAction = async (input: unknown): Promise<Result<PayoutPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	const result = await updatePayout(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/delivery/payouts');

	return result;
};

export const deletePayoutAction = async (payoutId: unknown): Promise<Result<{ id: string }>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail('Payout id is required.');
	}

	const result = await deletePayout(sessionResult.data.id, payoutIdResult.data);
	revalidatePath('/portal/delivery/payouts');
	revalidatePath('/portal/management/ongoing-payouts');
	revalidatePath('/portal/management/recipients');
	revalidatePath('/portal/programs/[programId]/recipients', 'page');

	return result;
};

export const getPayoutAction = async (payoutId: unknown): Promise<Result<PayoutPayload>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail('Payout id is required.');
	}

	return getPayout(sessionResult.data.id, payoutIdResult.data);
};

export const getPayoutRecipientOptionsAction = async (input: unknown = undefined): Promise<Result<RecipientOption[]>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutNoInputSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid input.');
	}

	return getEditableRecipientOptions(sessionResult.data.id);
};

export const confirmPayoutAction = async (payoutId: unknown): Promise<Result<string>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail('Payout id is required.');
	}

	const result = await updatePayoutStatus(sessionResult.data.id, payoutIdResult.data, PayoutStatus.confirmed);
	revalidatePath('/portal/monitoring/payout-confirmation');

	return result;
};

export const contestPayoutAction = async (payoutId: unknown): Promise<Result<string>> => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail('Payout id is required.');
	}

	const result = await updatePayoutStatus(sessionResult.data.id, payoutIdResult.data, PayoutStatus.contested);
	revalidatePath('/portal/monitoring/payout-confirmation');

	return result;
};

export const getPublicPayoutForecastTableAction = async (programId: unknown): Promise<Result<PayoutForecastTableView>> => {
	const programIdResult = payoutProgramIdSchema.safeParse(programId);
	if (!programIdResult.success) {
		return resultFail('Invalid program id');
	}

	return getPublicPayoutForecastTableView(programIdResult.data, PAYOUT_FORECAST_MONTHS_AHEAD);
};

export const getPublicCountryPayoutTotalsAction = async (isoCode: unknown): Promise<Result<CountryPayoutTotals>> => {
	const isoCodeResult = payoutCountryCodeSchema.safeParse(isoCode);
	if (!isoCodeResult.success) {
		return resultFail('Invalid country code');
	}

	return getPayoutTotalsForCountry(isoCodeResult.data);
};

export const getPublicLocalPartnerPayoutTotalsAction = async (
	localPartnerSlug: unknown,
): Promise<Result<CountryPayoutTotals>> => {
	const slugResult = payoutLocalPartnerSlugSchema.safeParse(localPartnerSlug);
	if (!slugResult.success) {
		return resultFail('Missing local partner slug');
	}

	return getPayoutTotalsForLocalPartnerSlug(slugResult.data);
};

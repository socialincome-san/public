'use server';

import { PayoutStatus } from '@/generated/prisma/enums';
import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { getEditableRecipientOptions } from '@/modules/recipients/recipient.service';
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

export const createPayoutAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutCreateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await createPayout(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/delivery/payouts');

	return result;
};

export const updatePayoutAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutUpdateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail(inputResult.error.issues[0]?.message ?? 'Invalid input.');
	}

	const result = await updatePayout(sessionResult.data.id, inputResult.data);
	revalidatePath('/portal/delivery/payouts');

	return result;
};

export const deletePayoutAction = async (payoutId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail(payoutIdResult.error.issues[0]?.message ?? 'Payout id is required.');
	}

	const result = await deletePayout(sessionResult.data.id, payoutIdResult.data);
	revalidatePath('/portal/delivery/payouts');
	revalidatePath('/portal/management/ongoing-payouts');
	revalidatePath('/portal/management/recipients');
	revalidatePath('/portal/programs/[programId]/recipients', 'page');

	return result;
};

export const getPayoutAction = async (payoutId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail(payoutIdResult.error.issues[0]?.message ?? 'Payout id is required.');
	}

	return getPayout(sessionResult.data.id, payoutIdResult.data);
};

export const getPayoutRecipientOptionsAction = async (input: unknown = undefined) => {
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

export const confirmPayoutAction = async (payoutId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail(payoutIdResult.error.issues[0]?.message ?? 'Payout id is required.');
	}

	const result = await updatePayoutStatus(sessionResult.data.id, payoutIdResult.data, PayoutStatus.confirmed);
	revalidatePath('/portal/monitoring/payout-confirmation');

	return result;
};

export const contestPayoutAction = async (payoutId: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const payoutIdResult = payoutIdSchema.safeParse(payoutId);
	if (!payoutIdResult.success) {
		return resultFail(payoutIdResult.error.issues[0]?.message ?? 'Payout id is required.');
	}

	const result = await updatePayoutStatus(sessionResult.data.id, payoutIdResult.data, PayoutStatus.contested);
	revalidatePath('/portal/monitoring/payout-confirmation');

	return result;
};

export const getPublicPayoutForecastTableAction = async (programId: unknown) => {
	const programIdResult = payoutProgramIdSchema.safeParse(programId);
	if (!programIdResult.success) {
		return resultFail(programIdResult.error.issues[0]?.message ?? 'Invalid program id');
	}

	return getPublicPayoutForecastTableView(programIdResult.data, PAYOUT_FORECAST_MONTHS_AHEAD);
};

export const getPublicCountryPayoutTotalsAction = async (isoCode: unknown) => {
	const isoCodeResult = payoutCountryCodeSchema.safeParse(isoCode);
	if (!isoCodeResult.success) {
		return resultFail(isoCodeResult.error.issues[0]?.message ?? 'Invalid country code');
	}

	return getPayoutTotalsForCountry(isoCodeResult.data);
};

export const getPublicLocalPartnerPayoutTotalsAction = async (localPartnerSlug: unknown) => {
	const slugResult = payoutLocalPartnerSlugSchema.safeParse(localPartnerSlug);
	if (!slugResult.success) {
		return resultFail(slugResult.error.issues[0]?.message ?? 'Missing local partner slug');
	}

	return getPayoutTotalsForLocalPartnerSlug(slugResult.data);
};

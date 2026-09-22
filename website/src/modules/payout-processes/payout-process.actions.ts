'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { resultFail } from '@/lib/service-result';
import { revalidatePath } from 'next/cache';
import {
	orangeMoneyPayoutProcessSchema,
	orangeMoneyRegistrationPayoutProcessSchema,
	payoutProcessDateSchema,
} from './payout-process.schemas';
import {
	generateOrangeCurrentMonthPayouts,
	generateOrangePayoutCsv,
	generateOrangeRegistrationCsv,
	generateTelecelCurrentMonthPayouts,
	generateTelecelPayoutCsv,
	getPayoutRecipientCounts,
	previewOrangeCurrentMonthPayouts,
	previewTelecelCurrentMonthPayouts,
} from './payout-process.service';

export const generateOrangeRegistrationCsvAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = orangeMoneyRegistrationPayoutProcessSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return generateOrangeRegistrationCsv(sessionResult.data.id, inputResult.data);
};

export const generateOrangePayoutCsvAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = orangeMoneyPayoutProcessSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return generateOrangePayoutCsv(sessionResult.data.id, inputResult.data);
};

export const previewOrangeCurrentMonthPayoutsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = orangeMoneyPayoutProcessSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return previewOrangeCurrentMonthPayouts(sessionResult.data.id, inputResult.data);
};

export const generateOrangeCurrentMonthPayoutsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = orangeMoneyPayoutProcessSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	const result = await generateOrangeCurrentMonthPayouts(sessionResult.data.id, inputResult.data);
	if (result.success) {
		revalidatePayoutProcessPaths();
	}

	return result;
};

export const generateTelecelPayoutCsvAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutProcessDateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return generateTelecelPayoutCsv(sessionResult.data.id, inputResult.data);
};

export const previewTelecelCurrentMonthPayoutsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutProcessDateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return previewTelecelCurrentMonthPayouts(sessionResult.data.id, inputResult.data);
};

export const generateTelecelCurrentMonthPayoutsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutProcessDateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	const result = await generateTelecelCurrentMonthPayouts(sessionResult.data.id, inputResult.data);
	if (result.success) {
		revalidatePayoutProcessPaths();
	}

	return result;
};

export const getPayoutRecipientCountsAction = async (input: unknown) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}

	const inputResult = payoutProcessDateSchema.safeParse(input);
	if (!inputResult.success) {
		return resultFail('Invalid payout process input.');
	}

	return getPayoutRecipientCounts(sessionResult.data.id, inputResult.data);
};

const revalidatePayoutProcessPaths = () => {
	revalidatePath('/portal/delivery/payouts');
	revalidatePath('/portal/delivery/overview');
};

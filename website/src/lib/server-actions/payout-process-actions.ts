'use server';

import { getSessionByType } from '@/lib/firebase/current-account';
import { ServiceResult } from '@/lib/services/core/base.types';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

const forUser = async <T>(run: (userId: string) => Promise<ServiceResult<T>>) => {
	const session = await getSessionByType('user');
	if (!session.success) {
		return session;
	}

	return run(session.data.id);
};

export const generateOrangeRegistrationCsvAction = async (mobileMoneyProviderId: string) =>
	forUser((userId) => services.orangeMoneyCsvPayoutProcess.generateRegistrationCSV(userId, mobileMoneyProviderId));

export const generateOrangePayoutCsvAction = async (mobileMoneyProviderId: string, selectedDate: Date) =>
	forUser((userId) => services.orangeMoneyCsvPayoutProcess.generatePayoutCSV(userId, mobileMoneyProviderId, selectedDate));

export const previewOrangeCurrentMonthPayoutsAction = async (mobileMoneyProviderId: string, selectedDate: Date) =>
	forUser((userId) =>
		services.orangeMoneyCsvPayoutProcess.previewCurrentMonthPayouts(userId, mobileMoneyProviderId, selectedDate),
	);

export const generateOrangeCurrentMonthPayoutsAction = async (mobileMoneyProviderId: string, selectedDate: Date) => {
	const result = await forUser((userId) =>
		services.orangeMoneyCsvPayoutProcess.generateCurrentMonthPayouts(userId, mobileMoneyProviderId, selectedDate),
	);

	if (result.success) {
		revalidatePath('/portal/delivery/payouts');
		revalidatePath('/portal/delivery/overview');
	}

	return result;
};

export const generateTelecelPayoutCsvAction = async (selectedDate: Date) =>
	forUser((userId) => services.telecelCsvPayoutProcess.generatePayoutCSV(userId, selectedDate));

export const previewTelecelCurrentMonthPayoutsAction = async (selectedDate: Date) =>
	forUser((userId) => services.telecelCsvPayoutProcess.previewCurrentMonthPayouts(userId, selectedDate));

export const generateTelecelCurrentMonthPayoutsAction = async (selectedDate: Date) => {
	const result = await forUser((userId) =>
		services.telecelCsvPayoutProcess.generateCurrentMonthPayouts(userId, selectedDate),
	);

	if (result.success) {
		revalidatePath('/portal/delivery/payouts');
		revalidatePath('/portal/delivery/overview');
	}

	return result;
};

export const getPayoutRecipientCountsAction = async (selectedDate: Date) =>
	forUser(async (userId) => {
		const optionsResult = await services.read.mobileMoneyProvider.getPayoutProcessOverviewOptions();
		if (!optionsResult.success) {
			return optionsResult;
		}

		const options = optionsResult.data;
		const counts: Record<string, number> = {};

		for (const option of options) {
			if (option.kind === 'telecel_csv') {
				const result = await services.telecelCsvPayoutProcess.countCurrentMonthPayouts(userId, selectedDate);
				if (!result.success) {
					return result;
				}
				counts[option.id] = result.data;
				continue;
			}

			const result = await services.orangeMoneyCsvPayoutProcess.countCurrentMonthPayouts(userId, option.id, selectedDate);
			if (!result.success) {
				return result;
			}
			counts[option.id] = result.data;
		}

		return { success: true as const, data: counts };
	});

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

export const generateRegistrationCsvAction = async (mobileMoneyProviderId: string) =>
	forUser((userId) => services.payoutProcess.generateRegistrationCSV(userId, mobileMoneyProviderId));

export const generatePayoutCsvAction = async (mobileMoneyProviderId: string, selectedDate: Date) =>
	forUser((userId) => services.payoutProcess.generatePayoutCSV(userId, mobileMoneyProviderId, selectedDate));

export const getPayoutRecipientCountsByProviderAction = async (mobileMoneyProviderIds: string[], selectedDate: Date) =>
	forUser(async (userId) => {
		const counts: Record<string, number> = {};

		for (const providerId of mobileMoneyProviderIds) {
			const result = await services.payoutProcess.countCurrentMonthPayouts(userId, providerId, selectedDate);
			if (!result.success) {
				return result;
			}
			counts[providerId] = result.data;
		}

		return { success: true as const, data: counts };
	});

export const previewCurrentMonthPayoutsAction = async (mobileMoneyProviderId: string, selectedDate: Date) =>
	forUser((userId) => services.payoutProcess.previewCurrentMonthPayouts(userId, mobileMoneyProviderId, selectedDate));

export const generateCurrentMonthPayoutsAction = async (mobileMoneyProviderId: string, selectedDate: Date) => {
	const result = await forUser((userId) =>
		services.payoutProcess.generateCurrentMonthPayouts(userId, mobileMoneyProviderId, selectedDate),
	);

	if (result.success) {
		revalidatePath('/portal/delivery/payouts');
		revalidatePath('/portal/delivery/overview');
	}

	return result;
};

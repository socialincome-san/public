'use server';

import { ROUTES } from '@/lib/constants/routes';
import { getSessionByType } from '@/lib/firebase/current-account';
import { services } from '@/lib/services/services';
import { revalidatePath } from 'next/cache';

export const generateRegistrationCsvAction = async () => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.payoutProcess.generateRegistrationCSV(sessionResult.data.id);
};

export const generatePayoutCsvAction = async (selectedDate: Date) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.payoutProcess.generatePayoutCSV(sessionResult.data.id, selectedDate);
};

export const previewCurrentMonthPayoutsAction = async (selectedDate: Date) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	return services.payoutProcess.previewCurrentMonthPayouts(sessionResult.data.id, selectedDate);
};

export const generateCurrentMonthPayoutsAction = async (selectedDate: Date) => {
	const sessionResult = await getSessionByType('user');
	if (!sessionResult.success) {
		return sessionResult;
	}
	const result = await services.payoutProcess.generateCurrentMonthPayouts(sessionResult.data.id, selectedDate);
	revalidatePath(ROUTES.portalDeliveryMakePayouts);
	return result;
};

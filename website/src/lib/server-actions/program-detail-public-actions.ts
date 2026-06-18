'use server';

import { resultFail } from '@/lib/services/core/service-result';
import { PAYOUT_FORECAST_MONTHS_AHEAD } from '@/lib/services/payout/payout-forecast.constants';
import { services } from '@/lib/services/services';

const normalizeProgramId = (programId: unknown): string | null => {
	if (typeof programId !== 'string') {
		return null;
	}

	const normalizedProgramId = programId.trim();

	return normalizedProgramId.length > 0 ? normalizedProgramId : null;
};

export const getPublicPayoutForecastTableAction = async (programId: string) => {
	const normalizedProgramId = normalizeProgramId(programId);
	if (!normalizedProgramId) {
		return resultFail('Invalid program id');
	}

	return services.read.payout.getPublicForecastTableView(normalizedProgramId, PAYOUT_FORECAST_MONTHS_AHEAD);
};

export const getPublicRecipientsTableAction = async (programId: string) => {
	const normalizedProgramId = normalizeProgramId(programId);
	if (!normalizedProgramId) {
		return resultFail('Invalid program id');
	}

	return services.read.recipient.getPublicRecipientsTableView(normalizedProgramId);
};

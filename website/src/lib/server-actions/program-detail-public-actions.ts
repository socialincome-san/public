'use server';

import { resultFail } from '@/lib/services/core/service-result';
import { getPublicRecipientsTableView } from '@/modules/recipients/recipient.service';

const normalizeProgramId = (programId: unknown): string | null => {
	if (typeof programId !== 'string') {
		return null;
	}

	const normalizedProgramId = programId.trim();

	return normalizedProgramId.length > 0 ? normalizedProgramId : null;
};

export const getPublicRecipientsTableAction = async (programId: string) => {
	const normalizedProgramId = normalizeProgramId(programId);
	if (!normalizedProgramId) {
		return resultFail('Invalid program id');
	}

	return getPublicRecipientsTableView(normalizedProgramId);
};

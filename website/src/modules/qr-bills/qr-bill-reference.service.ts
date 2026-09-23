import { resultOk, type ServiceResult } from '@/lib/service-result';
import type { QrBillReferenceParts } from './qr-bill.types';

const CONTRIBUTOR_REFERENCE_ID_LENGTH = 13;
const CONTRIBUTION_REFERENCE_ID_LENGTH = 10;

export const parseQrBillReference = (referenceId: string): ServiceResult<QrBillReferenceParts> => {
	if (referenceId.startsWith('0000000')) {
		return resultOk({
			contributorReferenceId: referenceId.slice(7, 20),
			contributionReferenceId: undefined,
		});
	}

	const startIndex = 3;

	return resultOk({
		contributorReferenceId: referenceId.slice(startIndex, startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH),
		contributionReferenceId: referenceId.slice(
			startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH,
			startIndex + CONTRIBUTOR_REFERENCE_ID_LENGTH + CONTRIBUTION_REFERENCE_ID_LENGTH,
		),
	});
};

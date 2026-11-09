import type { AuditContext } from '@/lib/audit/audit-types';
import { resultFail, resultOk, type Result } from '@/lib/result';
import { deleteFirebaseUserByEmailIfExists } from '@/modules/auth/auth.service';
import * as surveyRepository from './survey.repository.read';
import * as surveyWriteRepository from './survey.repository.write';

export const removeOutstandingSurveysForInterruptedRecipient = async (
	audit: AuditContext,
	recipientId: string,
): Promise<Result<void>> => {
	try {
		const surveys = await surveyRepository.findOutstandingSurveysForRecipient(recipientId);
		for (const survey of surveys) {
			const firebaseResult = await deleteFirebaseUserByEmailIfExists(survey.accessEmail);
			if (!firebaseResult.success) {
				return resultFail(firebaseResult.error);
			}
			await surveyWriteRepository.deleteSurvey(audit, survey.id);
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not remove outstanding surveys for interrupted recipient', { recipientId, error });

		return resultFail('Could not remove outstanding surveys for interrupted recipient');
	}
};

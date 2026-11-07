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
		let cleanupFailed = false;
		for (const survey of surveys) {
			try {
				const firebaseResult = await deleteFirebaseUserByEmailIfExists(survey.accessEmail);
				if (!firebaseResult.success) {
					cleanupFailed = true;
					console.error('Could not delete Firebase user for interrupted recipient survey', {
						recipientId,
						surveyId: survey.id,
						error: firebaseResult.error,
					});

					continue;
				}

				await surveyWriteRepository.deleteSurvey(audit, survey.id);
			} catch (error) {
				cleanupFailed = true;
				console.error('Could not remove interrupted recipient survey', {
					recipientId,
					surveyId: survey.id,
					error,
				});
			}
		}

		if (cleanupFailed) {
			return resultFail('Could not remove outstanding surveys for interrupted recipient');
		}

		return resultOk(undefined);
	} catch (error) {
		console.error('Could not remove outstanding surveys for interrupted recipient', { recipientId, error });

		return resultFail('Could not remove outstanding surveys for interrupted recipient');
	}
};

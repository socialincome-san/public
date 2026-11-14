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
					console.error('Could not delete Firebase user for interrupted recipient survey', {
						recipientId,
						surveyId: survey.id,
						error: firebaseResult.error,
					});
					cleanupFailed = true;
					continue;
				}

				await surveyWriteRepository.deleteSurvey(audit, survey.id);
			} catch (error) {
				if (isAlreadyDeleted(error)) {
					continue;
				}

				console.error('Could not delete outstanding survey for interrupted recipient', {
					recipientId,
					surveyId: survey.id,
					error,
				});
				cleanupFailed = true;
			}
		}

		return cleanupFailed
			? resultFail('Could not remove outstanding surveys for interrupted recipient')
			: resultOk(undefined);
	} catch (error) {
		console.error('Could not remove outstanding surveys for interrupted recipient', { recipientId, error });

		return resultFail('Could not remove outstanding surveys for interrupted recipient');
	}
};

const isAlreadyDeleted = (error: unknown): boolean =>
	typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025';

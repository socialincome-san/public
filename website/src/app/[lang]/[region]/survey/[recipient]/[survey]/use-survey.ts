/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { SurveyStatus } from '@/generated/prisma/enums';
import { signInWithEmailAndPassword } from '@/lib/firebase/client-auth';
import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { now } from '@/lib/utils/now';
import { createSessionAction, logoutAction } from '@/modules/auth/auth.actions';
import { getSurveyByIdAndRecipientAction, saveSurveyChangesAction } from '@/modules/surveys/survey.actions';
import type { SurveyWithRecipient } from '@/modules/surveys/survey.types';
import { useState } from 'react';
import { Model } from 'survey-core';

export const useSurvey = () => {
	const { auth } = useAuth();
	const [survey, setSurvey] = useState<SurveyWithRecipient | null>(null);
	const [hasError, setHasError] = useState<boolean>(false);

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const signInResult = await signInWithEmailAndPassword(auth, email, password);
			if (!signInResult.success) {
				setHasError(true);

				return false;
			}

			const result = await createSessionAction(signInResult.data.idToken);
			if (!result.success) {
				setHasError(true);

				return false;
			}

			return result.success;
		} catch (error) {
			console.error(`error during survey login: ${String(error)}`);
			setHasError(true);

			return false;
		}
	};

	const logout = async () => {
		return await logoutAction();
	};

	const loadSurvey = async (surveyId: string, recipientId: string) => {
		try {
			const surveyResult = await getSurveyByIdAndRecipientAction({ surveyId, recipientId });
			if (!surveyResult.success) {
				throw new Error(surveyResult.error);
			}
			setSurvey(surveyResult.data);
			setHasError(false);
		} catch (error) {
			console.error(`error loading survey: ${String(error)}`);
			setSurvey(null);
			setHasError(true);
			void logout();
		}
	};

	const saveSurvey = async (surveyId: string, survey: Model, status: SurveyStatus, retryCount = 0) => {
		const data = survey.data as Record<string, unknown> & { pageNo?: number };
		data.pageNo = survey.currentPageNo;
		try {
			const saveResult = await saveSurveyChangesAction({
				surveyId,
				input: {
					data: data as typeof survey.data,
					status: status,
					completedAt: status === SurveyStatus.completed ? now() : null,
				},
			});
			if (!saveResult.success) {
				throw new Error(saveResult.error);
			}
		} catch (error) {
			if (retryCount >= 2) {
				setHasError(true);
				void logout();
				console.error(`error saving survey, abording: ${String(error)}`);

				return;
			}
			console.error('error saving survey, retrying');
			retryCount++;
			globalThis.setTimeout(() => {
				void saveSurvey(surveyId, survey, status, retryCount);
			}, 2000);
		}
	};

	return { survey, hasError, login, logout, loadSurvey, saveSurvey };
};

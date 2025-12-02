import { useAuth } from '@/lib/firebase/hooks/useAuth';
import { createSessionAction, logoutAction } from '@/lib/server-actions/session-actions';
import { getByIdAndRecipient, saveChanges } from '@/lib/server-actions/survey-actions';
import { SurveyWithRecipient } from '@/lib/services/survey/survey.types';
import { SurveyStatus } from '@prisma/client';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useState } from 'react';
import { Model } from 'survey-core';

export function useSurvey() {
	const { auth } = useAuth();
	const [survey, setSurvey] = useState<SurveyWithRecipient | null>(null);
	const [hasError, setHasError] = useState<boolean>(false);

	const login = async (email: string, password: string): Promise<boolean> => {
		try {
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const idToken = await userCredential.user.getIdToken(true);

			const result = await createSessionAction(idToken);
			if (!result.success) {
				setHasError(true);
				return false;
			}
			return result.success;
		} catch (error) {
			console.log(error);
			setHasError(true);
			return false;
		}
	};

	const logout = async () => {
		return await logoutAction();
	};

	const loadSurvey = async (surveyId: string, recipientId: string) => {
		try {
			const result = await getByIdAndRecipient(surveyId, recipientId);
			if (result.success) {
				setSurvey(result.data);
				setHasError(false);
			} else {
				setSurvey(null);
				setHasError(true);
				logout();
			}
		} catch (error) {
			console.log(error);
			setSurvey(null);
			setHasError(true);
			logout();
		}
	};

	const saveSurvey = (surveyId: string, survey: Model, status: SurveyStatus, retryCount = 0) => {
		const data = survey.data;
		data.pageNo = survey.currentPageNo;
		saveChanges(surveyId, {
			data: data,
			status: status,
			completedAt: status == SurveyStatus.completed ? new Date(Date.now()) : null,
		})
			.then(() => {
				setHasError(false);
				console.log('saved successfully');
			})
			.catch(() => {
				if (retryCount >= 2) {
					setHasError(true);
					logout();
					console.log('error saving, abording');
					return;
				}
				console.log('error saving, retrying');
				retryCount++;
				window.setTimeout(() => saveSurvey(surveyId, survey, status, retryCount), 2000);
			});
	};

	return { survey, hasError, login, logout, loadSurvey, saveSurvey };
}

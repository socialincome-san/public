import { Model } from 'survey-core';
import { Survey as SurveyLibrary } from 'survey-react-ui';

import { useQuery } from '@tanstack/react-query';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import 'survey-core/defaultV2.min.css';
import { RECIPIENT_FIRESTORE_PATH } from '../../../shared/src/types/admin/Recipient';
import { Survey, SurveyStatus, SURVEY_FIRETORE_PATH } from '../../../shared/src/types/admin/Survey';
import { getFirebaseClients } from '../../utils/firestoreClient';
import { getSurveyParams, settings } from './common';
import { getQuestionnaire } from './questionnaires';

const fallbackLanguage = 'krio';

/**
 * Component to render a survey. The pages / questions are provided as props
 * Requires 4 GET parameters:
 * - recipient: recipient collection id
 * - survey: survey collection id
 * - email: firebase auth user which is linked to this survey
 * - pw: firebase auth user which is linked to this survey
 *
 * The component logins in with the provided firbease user and then retrieves the survey data.
 * Questionnaire, name and language are retrieved from the survey collection.
 * A firestore security rule takes care that a survey user can ony read, update its own survey
 */
export default function SurveyComponent() {
	const router = useRouter();
	const getParams = getSurveyParams(router);

	const { t, i18n } = useTranslation('website-survey');
	const { firestore } = getFirebaseClients();
	const surveyDoc = doc(
		firestore,
		[RECIPIENT_FIRESTORE_PATH, getParams.recipientId, SURVEY_FIRETORE_PATH, getParams.surveyId].join('/')
	);

	const authResult = useQuery(
		[],
		() => {
			const { auth } = getFirebaseClients();
			return signInWithEmailAndPassword(auth, getParams.accessEmail, getParams.accessPW);
		},
		{
			staleTime: 60 * 60 * 1000, // cache for 1 hour
		}
	);

	const surveyResult = useQuery(
		[authResult.data],
		async () => {
			const surveyRef = await getDoc(surveyDoc);
			const survey = surveyRef.data() as Survey;
			await i18n.changeLanguage(survey.language.toLowerCase() || fallbackLanguage);
			return survey;
		},
		{
			staleTime: 60 * 60 * 1000, // cache for 1 hour
			enabled: !!authResult.data,
		}
	);

	// todo style me
	if (authResult.isError || surveyResult.isError || !surveyResult.data) return t('survey.common.error');
	if (authResult.isLoading || surveyResult.isLoading) return t('survey.common.loading');

	const survey = new Model({
		...settings(t),
		pages: getQuestionnaire(surveyResult.data.questionnaire, t, surveyResult.data.recipient_name),
	});

	const storageName = 'social-income-survey-' + getParams.surveyId;
	const saveSurveyData = (survey: any, status: SurveyStatus) => {
		const data = survey.data;
		data.pageNo = survey.currentPageNo;
		// local storage in case one reloads the page
		window.localStorage.setItem(storageName, JSON.stringify(data));
		// firestore
		updateDoc(surveyDoc, {
			data: data,
			status: status,
			completed_at: status == SurveyStatus.Completed ? new Date(Date.now()) : null,
		});
	};
	survey.onPartialSend.add((data) => saveSurveyData(data, SurveyStatus.InProgress));
	survey.onComplete.add((data) => saveSurveyData(data, SurveyStatus.Completed));

	// loads existing answers from local cache
	const prevData = window.localStorage.getItem(storageName);
	if (prevData) {
		const data = JSON.parse(prevData);
		survey.data = data;
		if (data.pageNo) {
			survey.currentPageNo = data.pageNo;
		}
	}

	return <SurveyLibrary model={survey} />;
}

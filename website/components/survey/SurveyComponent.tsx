import { useTranslation } from 'next-i18next';
import 'survey-core/defaultV2.min.css';
import { Survey, SurveyStatus } from '../../../shared/src/types/admin/Survey';
// @ts-ignore
import { Model } from 'survey-core';
import { Survey as SurveyLibrary } from 'survey-react-ui';

import { settings } from './common';
import { getQuestionnaire } from './questionnaires';

/**
 * Component to render a survey.
 * Requires a user logged in which has access to retrieve and update the survey
 */
function SurveyComponent({ survey, storageName, onSave }: SurveyComponentProps) {
	const { t } = useTranslation('website-survey');
	const surveyModel = new Model({
		...settings(t),
		pages: getQuestionnaire(survey.questionnaire, t, survey.recipient_name),
	});

	surveyModel.onPartialSend.add((data) => onSave(data, SurveyStatus.InProgress));
	surveyModel.onComplete.add((data) => onSave(data, SurveyStatus.Completed));

	// loads existing answers from local cache
	const localStorageData = window.localStorage.getItem(storageName)
		? JSON.parse(window.localStorage.getItem(storageName)!)
		: undefined;
	const prevData = localStorageData ? localStorageData : survey.data;
	if (prevData) {
		surveyModel.data = prevData;
		if (prevData.pageNo) {
			surveyModel.currentPageNo = prevData.pageNo;
		}
	}

	return <SurveyLibrary model={surveyModel} />;
}

export default SurveyComponent;

export interface SurveyComponentProps {
	survey: Survey;
	storageName: string;
	onSave: (survey: any, status: SurveyStatus) => void;
}

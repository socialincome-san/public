'use client';

import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { logger } from '@/utils/logger';
import { SurveyStatus } from '@prisma/client';
import { useEffect } from 'react';
import { Model } from 'survey-core';
import 'survey-core/defaultV2.min.css';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from './common';
import { getQuestionnaire } from './questionnaires';
import './survey.css';
import { useSurvey } from './use-survey';

export type SurveyLanguage = Extract<WebsiteLanguage, 'en' | 'kri'>;

interface SurveyProps {
	surveyId: string;
	recipientId: string;
	lang: SurveyLanguage;
}

export function Survey({ surveyId, recipientId, lang }: SurveyProps) {
	const { survey, hasError, loadSurvey, saveSurvey } = useSurvey();

	// loadSurvey(surveyId, recipientId);
	useEffect(() => {
		loadSurvey(surveyId, recipientId);
	}, []);

	logger.info(`Survey render:  ${{ surveyId, recipientId, lang, survey, hasError }}`);

	const translator = useTranslator(lang, 'website-survey');

	logger.info(`translator ${translator}`);

	if (!hasError && survey && translator) {
		if (survey.status == SurveyStatus.completed) return <div>Survey already completed</div>;

		const model = new Model({
			...settings(translator.t),
			pages: getQuestionnaire(survey.questionnaire, translator.t, survey.nameOfRecipient),
		});
		model.currentPageNo = (survey.data as Model).pageNo;

		model.onPartialSend.add((data) => saveSurvey(surveyId, data, SurveyStatus.in_progress));
		model.onComplete.add((data) => saveSurvey(surveyId, data, SurveyStatus.completed));

		return <SurveyReact id="react-survey" model={model} />;
	} else if (hasError) {
		return <div>Error loading survey. Please try again later.</div>;
	}

	return <div>Loading...</div>;
}

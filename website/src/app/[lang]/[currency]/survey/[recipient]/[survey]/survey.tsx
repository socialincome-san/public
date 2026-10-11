'use client';
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { SurveyStatus } from '@/generated/prisma/enums';
import { useMessages, useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Model } from 'survey-core';
import 'survey-core/survey-core.min.css';
import { BorderlessLightPanelless } from 'survey-core/themes';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from './common';
import { getQuestionnaire } from './questionnaires';
import { useSurvey } from './use-survey';

type SurveyProps = {
	surveyId: string;
	recipientId: string;
};

export const Survey = ({ surveyId, recipientId }: SurveyProps) => {
	const { survey, hasError, loadSurvey, saveSurvey } = useSurvey();

	useEffect(() => {
		void loadSurvey(surveyId, recipientId);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [surveyId, recipientId]);

	const t = useTranslations('website-survey');
	const messages = useMessages();

	if (!hasError && survey) {
		if (survey.status === SurveyStatus.completed) {
			return <div>Survey already completed</div>;
		}

		const model = new Model({
			...settings(t),
			pages: getQuestionnaire(survey.questionnaire, t, messages, survey.nameOfRecipient),
		});
		model.applyTheme(BorderlessLightPanelless);
		model.currentPageNo = (survey.data as Model).pageNo;

		model.onPartialSend.add((data) => saveSurvey(surveyId, data, SurveyStatus.in_progress));
		model.onComplete.add((data) => saveSurvey(surveyId, data, SurveyStatus.completed));

		return <SurveyReact model={model} />;
	} else if (hasError) {
		return <div>Error loading survey. Please try again later.</div>;
	}

	return <div>Loading...</div>;
};

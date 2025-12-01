import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getByIdAndRecipient, saveChanges } from '@/lib/server-actions/survey-actions';
import { SurveyWithrecipient } from '@/lib/services/survey/survey.types';
import { SurveyStatus } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Model } from 'survey-core';
import 'survey-core/defaultV2.min.css';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from './common';
import { getQuestionnaire } from './questionnaires';

export type SurveyLanguage = Extract<WebsiteLanguage, 'en' | 'kri'>;

interface SurveyProps {
	surveyId: string;
	recipientId: string;
	lang: SurveyLanguage;
}

export function Survey({ surveyId, recipientId, lang }: SurveyProps) {
	const [survey, setSurvey] = useState<SurveyWithrecipient | null>(null);
	const [data, setData] = useState<Model | undefined>(undefined);

	useEffect(() => {
		async function fetchSurvey() {
			const result = await getByIdAndRecipient(surveyId, recipientId);
			if (result.success) {
				setSurvey(result.data);
			} else {
				setSurvey(null);
			}
		}
		fetchSurvey();
	}, [surveyId, recipientId]);

	useEffect(() => {
		if (!survey) return;
		try {
			setData(survey.data as Model);
		} catch (e) {
			console.error('Error parsing survey data', e);
		}
	}, [survey]);

	const translator = useTranslator(lang, 'website-survey');

	// TODO: implement session storage caching
	const saveSurveyData = (survey: Model, status: SurveyStatus) => {
		const data = survey.data;
		data.pageNo = survey.currentPageNo;
		saveChanges(surveyId, {
			data: data,
			status: status,
			completedAt: status == SurveyStatus.completed ? new Date(Date.now()) : null,
		})
			.then(() => console.log('saved successfully'))
			.catch(() => {
				console.log('error saving');
				window.setTimeout(() => saveSurveyData(survey, status), 3000);
			});
	};

	if (survey && data && translator) {
		if (survey.status == SurveyStatus.completed) return <div>Survey already completed</div>;

		const model = new Model({
			...settings(translator.t),
			pages: getQuestionnaire(survey.questionnaire, translator.t, survey.nameOfRecipient),
		});
		model.currentPageNo = data.pageNo;

		model.onPartialSend.add((data) => saveSurveyData(data, SurveyStatus.in_progress));
		model.onComplete.add((data) => saveSurveyData(data, SurveyStatus.completed));

		return <SurveyReact id="react-survey" model={model} />;
	}

	return <div>Loading...</div>;
}

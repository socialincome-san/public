import { firestore } from '@/firebase';
import {
	LocaleLanguage,
	RECIPIENT_FIRESTORE_PATH,
	SURVEY_FIRETORE_PATH,
	Survey as SurveyModel,
	SurveyStatus,
} from '@socialincome/shared/src/types';
import { Translator } from '@socialincome/shared/src/utils/i18n';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import { Model } from 'survey-core';
import 'survey-core/defaultV2.min.css';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from './common';
import { getQuestionnaire } from './questionnaires';
import './survey.css';

interface SurveyProps {
	surveyId: string;
	recipientId: string;
	lang: string;
}

export function Survey({ surveyId, recipientId, lang }: SurveyProps) {
	const ref = doc(firestore, [RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH, surveyId].join('/'));

	const { data: survey } = useQuery(
		[recipientId, surveyId],
		() => getDoc(ref).then((snapshot) => snapshot.data() as SurveyModel),
		{
			staleTime: 1000 * 60 * 60, // 1 hour
		},
	);

	const { data: translator } = useQuery(
		[lang],
		async () =>
			Translator.getInstance({
				language: lang as LocaleLanguage,
				namespaces: ['website-survey'],
			}),
		{
			staleTime: Infinity, // never refetch
		},
	);

	// TODO: implement session storage caching
	const saveSurveyData = useCallback(
		(survey: Model, status: SurveyStatus) => {
			const data = survey.data;
			data.pageNo = survey.currentPageNo;
			updateDoc(ref, {
				data: data,
				status: status,
				completed_at: status == SurveyStatus.Completed ? new Date(Date.now()) : null,
			})
				.then(() => console.log('saved successfully'))
				.catch(() => {
					console.log('error saving');
					window.setTimeout(() => saveSurveyData(survey, status), 3000);
				});
		},
		[ref],
	);

	if (survey && translator) {
		if (survey.status == SurveyStatus.Completed) return <div>Survey already completed</div>;

		const model = new Model({
			...settings(translator.t),
			pages: getQuestionnaire(survey.questionnaire, translator.t, survey.recipient_name),
		});
		model.currentPageNo = survey.data.pageNo;

		model.onPartialSend.add((data) => saveSurveyData(data, SurveyStatus.InProgress));
		model.onComplete.add((data) => saveSurveyData(data, SurveyStatus.Completed));

		return <SurveyReact id="react-survey" model={model} />;
	}

	return <div>Loading...</div>;
}

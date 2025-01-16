import { useTranslator } from '@/hooks/useTranslator';
import { WebsiteLanguage } from '@/i18n';
import { RECIPIENT_FIRESTORE_PATH } from '@socialincome/shared/src/types/recipient';
import { SURVEY_FIRETORE_PATH, Survey as SurveyModel, SurveyStatus } from '@socialincome/shared/src/types/survey';
import { useQuery } from '@tanstack/react-query';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useCallback } from 'react';
import { useFirestore } from 'reactfire';
import { Model } from 'survey-core';
import 'survey-core/defaultV2.min.css';
import { Survey as SurveyReact } from 'survey-react-ui';
import { settings } from './common';
import { getQuestionnaire } from './questionnaires';
import './survey.css';

export type SurveyLanguage = Extract<WebsiteLanguage, 'en' | 'kri'>;

interface SurveyProps {
	surveyId: string;
	recipientId: string;
	lang: SurveyLanguage;
}

export function Survey({ surveyId, recipientId, lang }: SurveyProps) {
	const firestore = useFirestore();
	const surveyDocRef = doc(
		firestore,
		[RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH, surveyId].join('/'),
	);
	const translator = useTranslator(lang, 'website-survey');
	const { data: survey } = useQuery({
		queryFn: () => getDoc(surveyDocRef).then((snapshot) => snapshot.data() as SurveyModel),
		queryKey: [recipientId, surveyId],
	});

	// TODO: implement session storage caching
	const saveSurveyData = useCallback(
		(survey: Model, status: SurveyStatus) => {
			const data = survey.data;
			data.pageNo = survey.currentPageNo;
			updateDoc(surveyDocRef, {
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
		[surveyDocRef],
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

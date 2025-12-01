import { useTranslator } from '@/lib/hooks/useTranslator';
import { WebsiteLanguage } from '@/lib/i18n/utils';
import { getByIdAndRecipient } from '@/lib/server-actions/survey-actions';
import { SurveyWithrecipient } from '@/lib/services/survey/survey.types';
import { SurveyStatus } from '@socialincome/shared/src/types/survey';
import { useCallback, useEffect, useState } from 'react';
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
	// const firestore = useFirestore();
	// const surveyDocRef = doc(
	// 	firestore,
	// 	[RECIPIENT_FIRESTORE_PATH, recipientId, SURVEY_FIRETORE_PATH, surveyId].join('/'),
	// );
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

	// const { data: survey } = useQuery({
	// 	queryFn: () => getDoc(surveyDocRef).then((snapshot) => snapshot.data() as SurveyModel),
	// 	queryKey: [recipientId, surveyId],
	// });

	// TODO: implement session storage caching
	const saveSurveyData = useCallback(
		(survey: Model, status: SurveyStatus) => {
			// 	const data = survey.data;
			// 	data.pageNo = survey.currentPageNo;
			// 	updateDoc(surveyDocRef, {
			// 		data: data,
			// 		status: status,
			// 		completed_at: status == SurveyStatus.Completed ? new Date(Date.now()) : null,
			// 	})
			// 		.then(() => console.log('saved successfully'))
			// 		.catch(() => {
			// 			console.log('error saving');
			// 			window.setTimeout(() => saveSurveyData(survey, status), 3000);
			// 		});
		},
		[survey],
	);

	if (survey && data && translator) {
		if (survey.status == SurveyStatus.Completed) return <div>Survey already completed</div>;

		const model = new Model({
			...settings(translator.t),
			pages: getQuestionnaire(survey.questionnaire, translator.t, survey.nameOfRecipient),
		});
		model.currentPageNo = data.pageNo;

		model.onPartialSend.add((data) => saveSurveyData(data, SurveyStatus.InProgress));
		model.onComplete.add((data) => saveSurveyData(data, SurveyStatus.Completed));

		return <SurveyReact id="react-survey" model={model} />;
	}

	return <div>Loading...</div>;
}

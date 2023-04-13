import { Alert, CircularProgress, Typography } from '@mui/material';
import { doc, getDoc, updateDoc } from 'firebase/firestore/lite';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import 'survey-core/defaultV2.min.css';
import { RECIPIENT_FIRESTORE_PATH } from '../../../shared/src/types/admin/Recipient';
import { Survey, SurveyStatus, SURVEY_FIRETORE_PATH } from '../../../shared/src/types/admin/Survey';
// @ts-ignore
import config from '../../config';

import { useEffect } from 'react';
import { useCookies } from 'react-cookie';

import { useQuery } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';
import { getFirebaseClients } from '../../utils/firebase';
import SurveyComponent from './SurveyComponent';

/**
 * Component to render a survey.
 * Requires a user logged in which has access to retrieve and update the survey
 */
export default function SurveyLoader(props: SurveyLoaderProps) {
	const { t } = useTranslation('website-survey');
	const router = useRouter();
	const [cookie] = useCookies(['NEXT_LOCALE']);
	const { firestore } = getFirebaseClients();

	const surveyDocRef = doc(
		firestore,
		[RECIPIENT_FIRESTORE_PATH, props.recipientId, SURVEY_FIRETORE_PATH, props.surveyId].join('/')
	);

	const { isLoading, data: surveyDoc } = useQuery(
		[props],
		() => {
			return getDoc(surveyDocRef);
		},
		{
			refetchOnWindowFocus: false,
			staleTime: 1000 * 60 * 60, // don't refresh data for 1 hour
		}
	);

	const survey = surveyDoc?.data() as Survey | undefined;

	useEffect(() => {
		if (!cookie.NEXT_LOCALE && survey) {
			console.log('Checking for best language');
			// best language for recipient
			const recipientLanguage = survey.language.toLowerCase();
			// best language for recipient supported by surveyDoc
			const supportedLanguage: string = config.surveyLanguages.hasOwnProperty(recipientLanguage)
				? recipientLanguage
				: config.defaultIsoCode;
			// redirect to other language in case the current language is different to the best or is explicitly set (by language switcher)
			if (router.locale !== supportedLanguage) {
				console.log(`Changing language to ${supportedLanguage}`);
				router.push({ pathname: router.pathname, query: router.query }, router.asPath, {
					locale: supportedLanguage,
				});
			}
		}
	}, [survey, cookie.NEXT_LOCALE, router]);

	if (survey) {
		const storageName = `social-income-survey-${props.recipientId}-${props.surveyId}`;
		const saveSurveyData = (survey: any, status: SurveyStatus) => {
			const data = survey.data;
			data.pageNo = survey.currentPageNo;

			// local storage in case one reloads the page
			window.localStorage.setItem(storageName, JSON.stringify(data));
			// firestore
			updateDoc(surveyDocRef, {
				data: data,
				status: status,
				completed_at: status == SurveyStatus.Completed ? new Date(Date.now()) : null,
			})
				.then(() => enqueueSnackbar(t('survey.common.progressSavingSuccess'), { variant: 'success' }))
				.catch(() => {
					enqueueSnackbar(t('survey.common.progressSavingError'), { variant: 'error', autoHideDuration: 3000 });
					window.setTimeout(() => saveSurveyData(survey, status), 3000);
				});
		};

		return <SurveyComponent survey={survey} storageName={storageName} onSave={saveSurveyData} />;
	} else {
		if (isLoading)
			return (
				<Typography align={'center'}>
					<CircularProgress />
				</Typography>
			);
		return <Alert severity="error">{t('survey.common.loadingError')}</Alert>;
	}
}

export interface SurveyLoaderProps {
	recipientId: string;
	surveyId: string;
}

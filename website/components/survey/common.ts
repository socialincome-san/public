import { TFunction } from 'i18next';
import { NextRouter } from 'next/router';

/**
 * GET parameters required for the survey pages
 */
export const getSurveyParams = (router: NextRouter) => {
	return {
		// used to retrieve the nested survey document
		recipientId: router.query['recipient'] as string,
		surveyId: router.query['survey'] as string,
		// firebase auth credentials
		accessEmail: router.query['email'] as string,
		accessPW: router.query['pw'] as string,
	};
};

/**
 * Shared settings among all surveys
 */
export const settings = (t: TFunction) => {
	return {
		logoPosition: 'right',
		showProgressBar: 'top',
		progressBarType: 'questions',
		sendResultOnPageNext: true,
		goNextPageAutomatic: false,
		firstPageIsStarted: true,
		// translations
		startSurveyText: t('survey.common.start'),
		pagePrevText: t('survey.common.previous'),
		pageNextText: t('survey.common.next'),
		completeText: t('survey.common.complete'),
		previewText: t('survey.common.preview'),
		editText: t('survey.common.edit'),
		loadingHtml: `<h3>${t('survey.common.loading')}</h3>`,
		completedHtml: `<h3>${t('survey.common.completed')}</h3>`,
		completedBeforeHtml: `<h3>${t('survey.common.alreadyCompleted')}</h3>`,
	};
};

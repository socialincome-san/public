import { TranslateFunction } from '@/lib/i18n/translator';

/**
 * Shared settings among all surveys
 */
export const settings = (t: TranslateFunction) => {
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

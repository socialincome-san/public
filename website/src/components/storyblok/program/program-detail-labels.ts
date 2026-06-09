import type { Translator } from '@/lib/i18n/translator';

export type ProgramDetailLabels = {
	finances: string;
	viewBreakdown: string;
	sentToRecipients: string;
	totalProgramCosts: string;
	availableCredits: string;
	aboutTitle: string;
	viewDetails: string;
	programOwner: string;
	localProgramOwner: string;
	programOperator: string;
	duration: string;
	monthSingular: string;
	monthPlural: string;
	startDate: string;
	recipients: string;
	viewDemographics: string;
	completedSurveys: string;
	viewImpactData: string;
	countryAnalysis: string;
	recipientSingular: string;
	recipientPlural: string;
};

export const buildProgramDetailLabels = (translator: Translator): ProgramDetailLabels => ({
	finances: translator.t('navigation.finances'),
	viewBreakdown: translator.t('program-detail-page.view-breakdown'),
	sentToRecipients: translator.t('program-detail-page.sent-to-recipients'),
	totalProgramCosts: translator.t('program-detail-page.total-program-costs'),
	availableCredits: translator.t('program-detail-page.available-credits'),
	aboutTitle: translator.t('program-detail-page.about-title'),
	viewDetails: translator.t('local-partners-page.view-details'),
	programOwner: translator.t('program-detail-page.program-owner'),
	localProgramOwner: translator.t('program-detail-page.local-program-owner'),
	programOperator: translator.t('program-detail-page.program-operator'),
	duration: translator.t('program-detail-page.duration'),
	monthSingular: translator.t('program-detail-page.month-singular'),
	monthPlural: translator.t('program-detail-page.month-plural'),
	startDate: translator.t('program-detail-page.start-date'),
	recipients: translator.t('navigation.recipients'),
	viewDemographics: translator.t('program-detail-page.view-demographics'),
	completedSurveys: translator.t('program-detail-page.completed-surveys'),
	viewImpactData: translator.t('program-detail-page.view-impact-data'),
	countryAnalysis: translator.t('program-detail-page.country-analysis'),
	recipientSingular: translator.t('programs-page.recipient-singular'),
	recipientPlural: translator.t('programs-page.recipient-plural'),
});

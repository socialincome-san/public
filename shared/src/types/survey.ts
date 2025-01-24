import { RecipientMainLanguage } from './recipient';
import { Timestamp } from './timestamp';

export const SURVEY_FIRETORE_PATH = 'surveys';

export enum SurveyStatus {
	New = 'new', // created but nothing done yet
	Sent = 'sent', // sent with the expectation that the recipient fills it out
	Scheduled = 'scheduled', // visit is scheduled
	InProgress = 'in-progress', // partially filled-out survey
	Completed = 'completed', // fully filled-out survey
	Missed = 'missed', // marked as too late to do
}

export enum SurveyQuestionnaire {
	Onboarding = 'onboarding',
	Checkin = 'checkin',
	Offboarding = 'offboarding',
	OffboardedCheckin = 'offboarded-checkin',
}

export type Survey = {
	questionnaire: SurveyQuestionnaire; // set of questions
	recipient_name: string; // used to address the recipient in the form. E.g. Hello XYZ.
	language: RecipientMainLanguage; // used to issue the survey in the appropriate language
	due_date_at: Timestamp; // till when the survey should be completed
	sent_at?: Timestamp; // date when the survey was sent to the recipient
	completed_at?: Timestamp; // date when the survey was completed
	status: SurveyStatus; // the different states of a survey
	comments?: string; // additional comments
	data: any; // the survey data
	access_email: string; // firebase auth user who can update this survey
	access_pw: string; // firebase auth user who can update this survey
	access_token: string; // smaller token which can be used together with recipients phone to login
};

export const recipientSurveys = [
	{ name: 'onboarding', startDateOffsetMonths: 0, questionaire: SurveyQuestionnaire.Onboarding },
	{ name: 'checkin-1', startDateOffsetMonths: 6, questionaire: SurveyQuestionnaire.Checkin },
	{ name: 'checkin-2', startDateOffsetMonths: 12, questionaire: SurveyQuestionnaire.Checkin },
	{ name: 'checkin-3', startDateOffsetMonths: 18, questionaire: SurveyQuestionnaire.Checkin },
	{ name: 'checkin-4', startDateOffsetMonths: 24, questionaire: SurveyQuestionnaire.Checkin },
	{ name: 'checkin-5', startDateOffsetMonths: 30, questionaire: SurveyQuestionnaire.Checkin },
	{ name: 'offboarding', startDateOffsetMonths: 36, questionaire: SurveyQuestionnaire.Offboarding },
	{ name: 'offboarded-checkin-1', startDateOffsetMonths: 42, questionaire: SurveyQuestionnaire.OffboardedCheckin },
	{ name: 'offboarded-checkin-2', startDateOffsetMonths: 48, questionaire: SurveyQuestionnaire.OffboardedCheckin },
	{ name: 'offboarded-checkin-3', startDateOffsetMonths: 60, questionaire: SurveyQuestionnaire.OffboardedCheckin },
	{ name: 'offboarded-checkin-4', startDateOffsetMonths: 72, questionaire: SurveyQuestionnaire.OffboardedCheckin },
];

export const getSurveyUrl = (baseUrl: string, survey: Survey, surveyId: string, recipientId: string) => {
	const url = new URL([baseUrl, 'survey', recipientId, surveyId].join('/'));
	url.search = new URLSearchParams({ email: survey.access_email, pw: survey.access_pw }).toString();
	return url.toString();
};

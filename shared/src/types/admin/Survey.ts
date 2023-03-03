import { RecipientMainLanguage } from './Recipient';

export const SURVEY_FIRETORE_PATH = 'surveys';

export enum SurveyStatus {
	New = 'new',
	Sent = 'sent',
	InProgress = 'in-progress',
	Completed = 'completed',
	Missed = 'missed',
}

export type Survey = {
	recipient_name: string; // used to address the recipient in the form. E.g. Hello XYZ.
	language: RecipientMainLanguage; // used to issue the survey in the appropriate language
	due_date_at: Date; // till when the survey should be completed
	sent_at?: Date; // date when the survey was sent to the recipient
	completed_at?: Date; // date when the survey was completed
	status: SurveyStatus; // the different states of a survey
	comments?: string; // additional comments
	data: any; // the survey data
	access_email: string; // firebase auth user who can update this survey
	access_pw: string; // firebase auth user who can update this survey
};

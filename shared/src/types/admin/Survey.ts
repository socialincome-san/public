export const SURVEY_PATH = 'surveys';

export enum SurveyStatus {
	New = 'new',
	Sent = 'sent',
	Started = 'started',
	Completed = 'completed',
	Missed = 'missed',
}

export type Survey = {
	access_email: string; // firebase auth user who can update this survey
	access_pw: string; // firebase auth user who can update this survey
	due_date_at: Date; // till when the survey should be completed
	sent_at: Date; // date when the survey was sent to the recipient
	completed_at: Date; // date when the survey was completed
	status: SurveyStatus;
	data: any; // the survey data
};

import { Property, StringProperty } from '@camberi/firecms/dist/types/properties';
import { SurveyQuestionnaire, SurveyStatus } from '@socialincome/shared/src/types';

export const surveyStatusProperty: StringProperty = {
	name: 'Status',
	dataType: 'string',
	enumValues: [
		{ id: SurveyStatus.New, label: 'New', color: 'grayDark' },
		{ id: SurveyStatus.Sent, label: 'Sent', color: 'blueDark' },
		{ id: SurveyStatus.Scheduled, label: 'Scheduled', color: 'blueLight' },
		{ id: SurveyStatus.InProgress, label: 'In Progress', color: 'orangeLight' },
		{ id: SurveyStatus.Completed, label: 'Completed', color: 'greenDark' },
		{ id: SurveyStatus.Missed, label: 'Missed', color: 'redDark' },
	],
};
export const surveyQuestionnaireProperty: StringProperty = {
	name: 'Questionnaire',
	dataType: 'string',
	readOnly: true,
	enumValues: [
		{ id: SurveyQuestionnaire.Onboarding, label: 'Onboarding' },
		{ id: SurveyQuestionnaire.Checkin, label: 'Checkin' },
		{ id: SurveyQuestionnaire.Offboarding, label: 'Offboarding' },
		{ id: SurveyQuestionnaire.OffboardedCheckin, label: 'OffboardedCheckin' },
	],
};
export const recipientNameProperty: Property = {
	name: 'Recipient Name',
	validation: { required: true },
	dataType: 'string',
};

export const dueDateAtProperty: Property = {
	name: 'Due Date At',
	dataType: 'date',
	mode: 'date',
	readOnly: true,
};

export const sentAtProperty: Property = {
	name: 'Sent At',
	dataType: 'date',
	mode: 'date',
};

export const completedAtProperty: Property = {
	name: 'Completed At',
	dataType: 'date',
	mode: 'date',
	readOnly: true,
};

export const commentsProperty: Property = {
	dataType: 'string',
	name: 'Comments',
	markdown: true,
};

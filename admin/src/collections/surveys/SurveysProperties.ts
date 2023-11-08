import { RecipientMainLanguage } from '@socialincome/shared/src/types/recipient';
import { SurveyQuestionnaire, SurveyStatus } from '@socialincome/shared/src/types/survey';
import { DateProperty, MapProperty, Property, StringProperty } from 'firecms/dist/types/properties';

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
export const recipientNameProperty: StringProperty = {
	name: 'Recipient Name',
	validation: { required: true },
	dataType: 'string',
};

export const languageProperty: StringProperty = {
	name: 'Preferred Language',
	dataType: 'string',

	validation: { required: true },
	enumValues: [
		{ id: RecipientMainLanguage.Krio, label: 'Krio' },
		{ id: RecipientMainLanguage.English, label: 'English' },
	],
};

export const dueDateAtProperty: DateProperty = {
	name: 'Due Date At',
	dataType: 'date',
	mode: 'date',
	readOnly: true,
};

export const sentAtProperty: DateProperty = {
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

export const accessTokenProperty: StringProperty = {
	dataType: 'string',
	name: 'Access Token',
	readOnly: true,
};

export const accessEmailProperty: StringProperty = {
	dataType: 'string',
	name: 'Access Email',
	readOnly: true,
	hideFromCollection: true,
};

export const accessPasswordProperty: StringProperty = {
	dataType: 'string',
	name: 'Access Password',
	readOnly: true,
	hideFromCollection: true,
};

export const dataProperty: MapProperty = {
	dataType: 'map',
	name: 'Data',
	readOnly: true,
	hideFromCollection: true,
};

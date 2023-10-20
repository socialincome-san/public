import { EntityCollection } from 'firecms/dist/types/collections';
import { SURVEY_FIRETORE_PATH, Survey } from '../../../../shared/src/types/Survey';
import { buildAuditedCollection } from '../shared';
import {
	accessEmailProperty,
	accessPasswordProperty,
	accessTokenProperty,
	commentsProperty,
	completedAtProperty,
	dataProperty,
	dueDateAtProperty,
	languageProperty,
	recipientNameProperty,
	sentAtProperty,
	surveyQuestionnaireProperty,
	surveyStatusProperty,
} from './SurveysProperties';

export function buildSurveysCollection(collectionProps?: Partial<EntityCollection<Survey>>) {
	return buildAuditedCollection<Survey>({
		name: 'Surveys',
		path: SURVEY_FIRETORE_PATH,
		inlineEditing: false,
		singularName: 'Survey',
		group: 'Surveys',
		icon: 'QuestionAnswer',
		properties: {
			questionnaire: surveyQuestionnaireProperty,
			recipient_name: recipientNameProperty,
			language: languageProperty,
			// @ts-ignore
			due_date_at: dueDateAtProperty,
			sent_at: sentAtProperty,
			completed_at: completedAtProperty,
			status: surveyStatusProperty,
			comments: commentsProperty,
			access_token: accessTokenProperty,
			access_pw: accessPasswordProperty,
			access_email: accessEmailProperty,
			data: dataProperty,
		},
		...collectionProps,
	});
}

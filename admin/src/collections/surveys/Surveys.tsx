import {
	AdditionalFieldDelegate,
	AsyncPreviewComponent,
	Entity,
	SideEntityController,
	StringPropertyPreview,
	useSideEntityController,
} from '@camberi/firecms';
import { Chip, Tooltip } from '@mui/material';
import { toYYYYMMDD } from '@socialincome/shared/src/utils/date';
import _ from 'lodash';
import moment from 'moment';
import { Fragment } from 'react';
import { Recipient, Survey, SurveyStatus, SURVEY_FIRETORE_PATH } from '../../../../shared/src/types';
import CopyToClipboard from '../../components/CopyToClipboard';
import OpenDetailView from '../../components/OpenDetailView';
import { mainLanguageProperty } from '../recipients/RecipientsProperties';
import { buildAuditedCollection } from '../shared';
import {
	commentsProperty,
	completedAtProperty,
	dueDateAtProperty,
	recipientNameProperty,
	sentAtProperty,
	surveyQuestionnaireProperty,
	surveyStatusProperty,
} from './SurveysProperties';

export const surveysCollection = buildAuditedCollection<Partial<Survey>>({
	additionalFields: [],
	inlineEditing: false,
	name: 'Surveys',
	path: SURVEY_FIRETORE_PATH,
	singularName: 'Survey',
	properties: {
		questionnaire: surveyQuestionnaireProperty,
		recipient_name: recipientNameProperty,
		language: mainLanguageProperty,
		due_date_at: dueDateAtProperty,
		sent_at: sentAtProperty,
		completed_at: completedAtProperty,
		status: surveyStatusProperty,
		comments: commentsProperty,
	},
});

export const createSurveyColumn = (surveyName: string): AdditionalFieldDelegate<Partial<Recipient>> => {
	const sideEntityController = useSideEntityController();
	return {
		id: surveyName,
		name: surveyName,
		width: 250,
		Builder: ({ entity, context }) => {
			return (
				<AsyncPreviewComponent
					builder={context.dataSource
						.fetchEntity({
							path: [entity.path, entity.id, SURVEY_FIRETORE_PATH].join('/'),
							entityId: surveyName,
							collection: surveysCollection,
						})
						.then((entity) => entity && surveyPreview(entity, sideEntityController))}
				/>
			);
		},
	};
};

export const createPendingSurveyColumn = (i: number): AdditionalFieldDelegate<Partial<Recipient>> => {
	const sideEntityController = useSideEntityController();

	return {
		id: 'nextSurvey',
		name: 'nextSurvey',
		width: 400,
		Builder: ({ entity, context }) => {
			const path = [entity.path, entity.id, SURVEY_FIRETORE_PATH].join('/');
			return (
				<AsyncPreviewComponent
					builder={context.dataSource
						.fetchCollection({
							path: path,
							collection: surveysCollection,
						})
						.then((collection) => {
							const nextSurvey = _(collection)
								.sortBy((survey) => survey.values.due_date_at)
								.filter(
									(survey) =>
										survey.values?.status != undefined &&
										[SurveyStatus.Sent, SurveyStatus.New, SurveyStatus.Started, SurveyStatus.Completed].includes(
											survey.values?.status
										)
								)
								.value()
								.at(i);

							return (
								nextSurvey && (
									<Fragment>
										<Chip size={'small'} color={'info'} label={nextSurvey.id} />
										&nbsp;
										{surveyPreview(nextSurvey, sideEntityController)}
									</Fragment>
								)
							);
						})}
				/>
			);
		},
	};
};

const surveyPreview = (entity: Entity<Partial<Survey>>, sideEntityController: SideEntityController) => {
	return (
		<Fragment>
			<StringPropertyPreview property={surveyStatusProperty} value={entity?.values?.status || ''} size={'small'} />
			&nbsp;
			{surveyDueDateClip(entity)}
			&nbsp;
			<OpenDetailView entity={entity} collection={surveysCollection} sideEntityController={sideEntityController} />
			&nbsp;
			{/*// todo add proper survey link*/}
			<CopyToClipboard title={'Copy survey url to clipboard'} data={''} />
		</Fragment>
	);
};

const surveyDueDateClip = (entity: Entity<Partial<Survey>>) => {
	// todo discuss logic
	const color =
		moment(entity.values.due_date_at).isBefore(moment()) && entity.values.status != SurveyStatus.Completed
			? 'warning'
			: 'info';

	return (
		entity.values.due_date_at && (
			<Tooltip title={'Due date ' + toYYYYMMDD(entity.values.due_date_at)}>
				<Chip size={'small'} color={color} label={moment(entity.values.due_date_at).fromNow()} />
			</Tooltip>
		)
	);
};

import { PrismaClient, ProgramPermission } from '@/generated/prisma/client';
import { logger } from '@/lib/utils/logger';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { FirebaseAdminService } from '../firebase/firebase-admin.service';
import { ProgramAccessReadService } from '../program-access/program-access-read.service';
import { SurveyReadService } from './survey-read.service';
import { SurveyCreateInput, SurveyGenerationResult, SurveyPayload, SurveyUpdateInput } from './survey.types';

export class SurveyWriteService extends BaseService {
	constructor(
		db: PrismaClient,
		private readonly programAccessService: ProgramAccessReadService,
		private readonly firebaseAdminService: FirebaseAdminService,
		private readonly surveyReadService: SurveyReadService,
		loggerInstance = logger,
	) {
		super(db, loggerInstance);
	}

	private toPayload(survey: {
		id: string;
		name: string;
		questionnaire: SurveyPayload['questionnaire'];
		language: string;
		dueAt: Date;
		completedAt: Date | null;
		status: SurveyPayload['status'];
		data: SurveyPayload['data'];
		accessEmail: string;
		accessPw: string;
		recipientId: string;
		surveyScheduleId: string | null;
		createdAt: Date;
		updatedAt: Date | null;
	}): SurveyPayload {
		return {
			id: survey.id,
			name: survey.name,
			questionnaire: survey.questionnaire,
			language: survey.language,
			dueAt: survey.dueAt,
			completedAt: survey.completedAt,
			status: survey.status,
			data: survey.data,
			accessEmail: survey.accessEmail,
			accessPw: survey.accessPw,
			recipientId: survey.recipientId,
			surveyScheduleId: survey.surveyScheduleId,
			createdAt: survey.createdAt,
			updatedAt: survey.updatedAt,
		};
	}

	async create(userId: string, input: SurveyCreateInput): Promise<ServiceResult<SurveyPayload>> {
		try {
			if (!input.recipient?.connect?.id) {
				return this.resultFail('Recipient is required');
			}

			const recipient = await this.db.recipient.findUnique({
				where: { id: input.recipient.connect.id },
				select: { program: { select: { id: true } } },
			});

			if (!recipient) {
				return this.resultFail('Recipient not found');
			}

			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === recipient.program?.id);
			if (!programAccess || programAccess.permission === ProgramPermission.owner) {
				return this.resultFail('Access denied');
			}

			const survey = await this.db.survey.create({
				data: input,
			});

			return this.resultOk(this.toPayload(survey));
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to create survey: ${JSON.stringify(error)}`);
		}
	}

	async update(userId: string, surveyId: string, input: SurveyUpdateInput): Promise<ServiceResult<SurveyPayload>> {
		try {
			const survey = await this.db.survey.findUnique({
				where: { id: surveyId },
				select: { recipient: { select: { program: { select: { id: true } } } } },
			});

			if (!survey) {
				return this.resultFail('Survey not found');
			}

			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === survey.recipient.program?.id);
			if (!programAccess || programAccess.permission === ProgramPermission.owner) {
				return this.resultFail('Access denied');
			}

			const updatedSurvey = await this.db.survey.update({
				where: { id: surveyId },
				data: input,
			});

			return this.resultOk(this.toPayload(updatedSurvey));
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to update survey: ${JSON.stringify(error)}`);
		}
	}

	async generateSurveys(userId: string): Promise<ServiceResult<SurveyGenerationResult>> {
		try {
			const previewResult = await this.surveyReadService.previewSurveyGeneration(userId);
			if (!previewResult.success) {
				return this.resultFail(previewResult.error);
			}

			const surveysToCreate = previewResult.data.surveys;
			if (surveysToCreate.length === 0) {
				return this.resultOk({
					surveysCreated: 0,
					message: 'No surveys to create',
				});
			}

			let surveysCreated = 0;

			for (const surveyInput of surveysToCreate) {
				const firebaseResult = await this.firebaseAdminService.createSurveyUser(
					surveyInput.accessEmail,
					surveyInput.accessPw,
				);
				if (!firebaseResult.success) {
					return this.resultFail(`Failed to create Firebase user: ${firebaseResult.error}`);
				}
				await this.db.survey.create({ data: surveyInput });
				surveysCreated++;
			}

			return this.resultOk({
				surveysCreated,
				message: `Successfully created ${surveysCreated} surveys`,
			});
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to generate surveys: ${JSON.stringify(error)}`);
		}
	}

	async saveChanges(surveyId: string, input: SurveyUpdateInput): Promise<ServiceResult<SurveyPayload>> {
		try {
			const survey = await this.db.survey.findUnique({
				where: { id: surveyId },
			});

			if (!survey) {
				return this.resultFail('Survey not found');
			}

			const updatedSurvey = await this.db.survey.update({
				where: { id: surveyId },
				data: input,
			});

			return this.resultOk(this.toPayload(updatedSurvey));
		} catch (error) {
			this.logger.error(error);
			return this.resultFail(`Failed to update survey: ${JSON.stringify(error)}`);
		}
	}
}

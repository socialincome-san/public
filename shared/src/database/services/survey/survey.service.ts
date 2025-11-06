import { ProgramPermission } from '@prisma/client';
import { isFuture } from 'date-fns';
import { BaseService } from '../core/base.service';
import { ServiceResult } from '../core/base.types';
import { ProgramAccessService } from '../program-access/program-access.service';
import {
	SurveyCreateInput,
	SurveyPayload,
	SurveyTableView,
	SurveyTableViewRow,
	SurveyUpdateInput,
} from './survey.types';

export class SurveyService extends BaseService {
	private programAccessService = new ProgramAccessService();

	async getTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const accessiblePrograms = accessibleProgramsResult.data;
			if (accessiblePrograms.length === 0) {
				return this.resultOk({ tableRows: [] });
			}

			const programIds = accessiblePrograms.map((p) => p.programId);
			const surveys = await this.db.survey.findMany({
				where: { recipient: { programId: { in: programIds } } },
				select: {
					id: true,
					questionnaire: true,
					status: true,
					language: true,
					dueAt: true,
					completedAt: true,
					createdAt: true,
					accessEmail: true,
					accessPw: true,
					recipient: {
						select: {
							id: true,
							contact: { select: { firstName: true, lastName: true } },
							program: { select: { id: true, name: true } },
						},
					},
				},
				orderBy: { dueAt: 'desc' },
			});

			const tableRows: SurveyTableViewRow[] = surveys.map((survey) => {
				const programId = survey.recipient.program.id;
				const access = accessiblePrograms.find((p) => p.programId === programId);
				const permission = access?.permission ?? ProgramPermission.readonly;

				return {
					id: survey.id,
					recipientName:
						`${survey.recipient.contact?.firstName ?? ''} ${survey.recipient.contact?.lastName ?? ''}`.trim(),
					programId,
					programName: survey.recipient.program.name,
					questionnaire: survey.questionnaire,
					status: survey.status,
					language: survey.language,
					dueAt: survey.dueAt,
					completedAt: survey.completedAt,
					createdAt: survey.createdAt,
					surveyUrl: this.buildSurveyUrl({
						surveyId: survey.id,
						recipientId: survey.recipient.id,
						accessEmail: survey.accessEmail,
						accessPw: survey.accessPw,
					}),
					permission,
				};
			});

			return this.resultOk({ tableRows });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch surveys');
		}
	}

	async getUpcomingSurveyTableView(userId: string): Promise<ServiceResult<SurveyTableView>> {
		try {
			const allSurveysResult = await this.getTableView(userId);
			if (!allSurveysResult.success) {
				return allSurveysResult;
			}

			const upcoming = allSurveysResult.data.tableRows.filter((row) => isFuture(row.dueAt));

			return this.resultOk({ tableRows: upcoming });
		} catch (error) {
			console.error(error);
			return this.resultFail('Could not fetch upcoming surveys');
		}
	}

	async getTableViewProgramScoped(userId: string, programId: string): Promise<ServiceResult<SurveyTableView>> {
		const base = await this.getTableView(userId);
		if (!base.success) {
			return base;
		}

		const filteredRows = base.data.tableRows.filter((row) => row.programId === programId);
		return this.resultOk({ tableRows: filteredRows });
	}

	private buildSurveyUrl({
		surveyId,
		recipientId,
		accessEmail,
		accessPw,
	}: {
		surveyId: string;
		recipientId: string;
		accessEmail: string;
		accessPw: string;
	}): string {
		const base = (process.env.BASE_URL ?? '').replace(/\/+$/, '');
		const url = new URL([base, 'survey', recipientId, surveyId].join('/'));
		url.search = new URLSearchParams({ email: accessEmail, pw: accessPw }).toString();
		return url.toString();
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

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === recipient.program.id);
			if (!programAccess || programAccess.permission === ProgramPermission.readonly) {
				return this.resultFail('Access denied');
			}

			const survey = await this.db.survey.create({
				data: input,
			});

			const payload: SurveyPayload = {
				id: survey.id,
				questionnaire: survey.questionnaire,
				language: survey.language,
				dueAt: survey.dueAt,
				completedAt: survey.completedAt,
				status: survey.status,
				data: survey.data,
				accessEmail: survey.accessEmail,
				accessPw: survey.accessPw,
				accessToken: survey.accessToken,
				recipientId: survey.recipientId,
				surveyScheduleId: survey.surveyScheduleId,
				createdAt: survey.createdAt,
				updatedAt: survey.updatedAt,
			};

			return this.resultOk(payload);
		} catch (error) {
			console.error(error);
			return this.resultFail(`Failed to create survey: ${error}`);
		}
	}

	async get(userId: string, surveyId: string): Promise<ServiceResult<SurveyPayload>> {
		try {
			const survey = await this.db.survey.findUnique({
				where: { id: surveyId },
				include: {
					recipient: {
						select: { program: { select: { id: true } } },
					},
				},
			});

			if (!survey) {
				return this.resultFail('Survey not found');
			}

			const accessibleProgramsResult = await this.programAccessService.getAccessiblePrograms(userId);
			if (!accessibleProgramsResult.success) {
				return this.resultFail(accessibleProgramsResult.error);
			}

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === survey.recipient.program.id);
			if (!programAccess) {
				return this.resultFail('Access denied');
			}

			const payload: SurveyPayload = {
				id: survey.id,
				questionnaire: survey.questionnaire,
				language: survey.language,
				dueAt: survey.dueAt,
				completedAt: survey.completedAt,
				status: survey.status,
				data: survey.data,
				accessEmail: survey.accessEmail,
				accessPw: survey.accessPw,
				accessToken: survey.accessToken,
				recipientId: survey.recipientId,
				surveyScheduleId: survey.surveyScheduleId,
				createdAt: survey.createdAt,
				updatedAt: survey.updatedAt,
			};

			return this.resultOk(payload);
		} catch (error) {
			console.error(error);
			return this.resultFail(`Failed to get survey: ${error}`);
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

			const programAccess = accessibleProgramsResult.data.find((p) => p.programId === survey.recipient.program.id);
			if (!programAccess || programAccess.permission === ProgramPermission.readonly) {
				return this.resultFail('Access denied');
			}

			const updatedSurvey = await this.db.survey.update({
				where: { id: surveyId },
				data: input,
			});

			const payload: SurveyPayload = {
				id: updatedSurvey.id,
				questionnaire: updatedSurvey.questionnaire,
				language: updatedSurvey.language,
				dueAt: updatedSurvey.dueAt,
				completedAt: updatedSurvey.completedAt,
				status: updatedSurvey.status,
				data: updatedSurvey.data,
				accessEmail: updatedSurvey.accessEmail,
				accessPw: updatedSurvey.accessPw,
				accessToken: updatedSurvey.accessToken,
				recipientId: updatedSurvey.recipientId,
				surveyScheduleId: updatedSurvey.surveyScheduleId,
				createdAt: updatedSurvey.createdAt,
				updatedAt: updatedSurvey.updatedAt,
			};

			return this.resultOk(payload);
		} catch (error) {
			console.error(error);
			return this.resultFail(`Failed to update survey: ${error}`);
		}
	}
}
